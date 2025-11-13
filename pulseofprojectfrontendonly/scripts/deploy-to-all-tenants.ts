/**
 * Deploy to All Tenants Script
 * Runs database migrations and updates on all active tenants
 *
 * Usage:
 *   npm run deploy-tenants
 *   npm run deploy-tenants -- --dry-run
 *   npm run deploy-tenants -- --tenant kerala-2026
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DeploymentOptions {
  dryRun?: boolean;
  specificTenant?: string;
  migrationsOnly?: boolean;
  skipBackup?: boolean;
}

interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  supabaseUrl: string;
  supabaseProjectId: string;
  databaseUrl: string;
  serviceKey: string;
}

interface DeploymentResult {
  tenantSlug: string;
  success: boolean;
  migrationsRun: string[];
  duration: number;
  error?: string;
}

/**
 * Get all active tenants from registry
 */
async function getAllActiveTenants(
  registryUrl: string,
  registryKey: string,
  specificTenant?: string
): Promise<TenantInfo[]> {
  console.log('Fetching active tenants from registry...');

  const supabase = createClient(registryUrl, registryKey);

  let query = supabase
    .from('tenants')
    .select('*, credentials:tenant_credentials(*)')
    .eq('status', 'active')
    .in('subscription_status', ['active', 'trial']);

  if (specificTenant) {
    query = query.eq('slug', specificTenant);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tenants: ${error.message}`);
  }

  if (!data || data.length === 0) {
    if (specificTenant) {
      throw new Error(`Tenant '${specificTenant}' not found or not active`);
    }
    throw new Error('No active tenants found');
  }

  console.log(`Found ${data.length} active tenant(s)\n`);

  return data.map((tenant: any) => ({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    supabaseUrl: tenant.supabase_url,
    supabaseProjectId: tenant.supabase_project_id,
    databaseUrl: tenant.credentials?.[0]?.database_url || '',
    serviceKey: tenant.credentials?.[0]?.supabase_service_key || '',
  }));
}

/**
 * Get pending migrations
 */
function getPendingMigrations(appliedMigrations: string[]): string[] {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const allMigrations = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  return allMigrations.filter((m) => !appliedMigrations.includes(m));
}

/**
 * Get applied migrations for a tenant
 */
async function getAppliedMigrations(
  supabaseUrl: string,
  serviceKey: string
): Promise<string[]> {
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data, error } = await supabase
      .from('tenant_deployments')
      .select('migration_files')
      .eq('success', true)
      .order('completed_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Could not fetch applied migrations, assuming none:', error.message);
      return [];
    }

    const allMigrations = new Set<string>();
    data?.forEach((deployment: any) => {
      deployment.migration_files?.forEach((file: string) => allMigrations.add(file));
    });

    return Array.from(allMigrations);
  } catch (error) {
    console.warn('Could not fetch applied migrations:', error);
    return [];
  }
}

/**
 * Create backup of tenant database
 */
async function createBackup(tenant: TenantInfo): Promise<string> {
  console.log(`  Creating backup for ${tenant.slug}...`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${tenant.slug}-${timestamp}.sql`;
  const backupPath = path.join(__dirname, '../backups', backupFile);

  // Ensure backups directory exists
  const backupsDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  try {
    execSync(`pg_dump "${tenant.databaseUrl}" > "${backupPath}"`, {
      encoding: 'utf-8',
    });

    console.log(`  ✓ Backup created: ${backupFile}`);
    return backupPath;
  } catch (error) {
    console.error(`  ✗ Backup failed:`, error);
    throw error;
  }
}

/**
 * Run migrations on a tenant
 */
async function runMigrations(
  tenant: TenantInfo,
  migrations: string[]
): Promise<string[]> {
  console.log(`  Running ${migrations.length} migration(s)...`);

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const successful: string[] = [];

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    console.log(`    - ${migration}...`);

    try {
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Execute migration using psql
      execSync(`psql "${tenant.databaseUrl}" -c "${sql.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      console.log(`    ✓ ${migration} completed`);
      successful.push(migration);
    } catch (error: any) {
      console.error(`    ✗ ${migration} failed:`, error.message);
      throw new Error(`Migration ${migration} failed: ${error.message}`);
    }
  }

  return successful;
}

/**
 * Record deployment in tenant database
 */
async function recordDeployment(
  supabaseUrl: string,
  serviceKey: string,
  migrationFiles: string[],
  success: boolean,
  error?: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    await supabase.from('tenant_deployments').insert({
      deployment_type: 'migration',
      version: new Date().toISOString().split('T')[0],
      migration_files: migrationFiles,
      success,
      error_message: error,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      deployed_by: 'automated-deployment',
    });
  } catch (err) {
    console.warn('Could not record deployment:', err);
  }
}

/**
 * Deploy to a single tenant
 */
async function deployToTenant(
  tenant: TenantInfo,
  options: DeploymentOptions
): Promise<DeploymentResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Deploying to: ${tenant.name} (${tenant.slug})`);
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    // 1. Get applied migrations
    const appliedMigrations = await getAppliedMigrations(
      tenant.supabaseUrl,
      tenant.serviceKey
    );
    console.log(`  Applied migrations: ${appliedMigrations.length}`);

    // 2. Get pending migrations
    const pendingMigrations = getPendingMigrations(appliedMigrations);
    console.log(`  Pending migrations: ${pendingMigrations.length}`);

    if (pendingMigrations.length === 0) {
      console.log(`  ✓ No migrations needed`);
      const duration = Date.now() - startTime;
      return {
        tenantSlug: tenant.slug,
        success: true,
        migrationsRun: [],
        duration,
      };
    }

    // 3. Create backup (unless skipped)
    if (!options.skipBackup && !options.dryRun) {
      await createBackup(tenant);
    }

    // 4. Run migrations (unless dry run)
    let migrationsRun: string[] = [];

    if (options.dryRun) {
      console.log(`  [DRY RUN] Would run ${pendingMigrations.length} migration(s):`);
      pendingMigrations.forEach((m) => console.log(`    - ${m}`));
    } else {
      migrationsRun = await runMigrations(tenant, pendingMigrations);

      // Record deployment
      await recordDeployment(tenant.supabaseUrl, tenant.serviceKey, migrationsRun, true);
    }

    const duration = Date.now() - startTime;

    console.log(`  ✓ Deployment completed in ${(duration / 1000).toFixed(2)}s`);

    return {
      tenantSlug: tenant.slug,
      success: true,
      migrationsRun: options.dryRun ? pendingMigrations : migrationsRun,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error(`  ✗ Deployment failed:`, error.message);

    // Record failed deployment
    if (!options.dryRun) {
      await recordDeployment(tenant.supabaseUrl, tenant.serviceKey, [], false, error.message);
    }

    return {
      tenantSlug: tenant.slug,
      success: false,
      migrationsRun: [],
      duration,
      error: error.message,
    };
  }
}

/**
 * Send deployment notification
 */
async function sendNotification(results: DeploymentResult[]): Promise<void> {
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  const message = `
Deployment Summary
==================
Total Tenants: ${results.length}
Successful: ${successful}
Failed: ${failed}
Total Duration: ${(totalDuration / 1000).toFixed(2)}s

${failed > 0 ? '\nFailed Tenants:\n' + results.filter(r => !r.success).map(r => `- ${r.tenantSlug}: ${r.error}`).join('\n') : ''}
`;

  console.log(message);

  // TODO: Send to Slack/email/monitoring service
  const webhookUrl = process.env.DEPLOYMENT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    } catch (error) {
      console.warn('Failed to send notification:', error);
    }
  }
}

/**
 * Main deployment function
 */
export async function deployToAllTenants(options: DeploymentOptions = {}): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('MULTI-TENANT DEPLOYMENT');
  console.log('='.repeat(60));

  if (options.dryRun) {
    console.log('\n*** DRY RUN MODE - No changes will be made ***\n');
  }

  const startTime = Date.now();

  try {
    // Get registry credentials
    const registryUrl = process.env.VITE_TENANT_REGISTRY_URL;
    const registryKey = process.env.TENANT_REGISTRY_SERVICE_KEY;

    if (!registryUrl || !registryKey) {
      throw new Error('Registry credentials not configured');
    }

    // Get all active tenants
    const tenants = await getAllActiveTenants(registryUrl, registryKey, options.specificTenant);

    // Deploy to each tenant
    const results: DeploymentResult[] = [];

    for (const tenant of tenants) {
      const result = await deployToTenant(tenant, options);
      results.push(result);

      // Small delay between tenants to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Print summary
    const totalDuration = (Date.now() - startTime) / 1000;

    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tenants: ${results.length}`);
    console.log(`Successful: ${results.filter((r) => r.success).length}`);
    console.log(`Failed: ${results.filter((r) => !r.success).length}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log('='.repeat(60) + '\n');

    // Send notification
    await sendNotification(results);

    // Exit with error if any deployments failed
    if (results.some((r) => !r.success)) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('DEPLOYMENT FAILED');
    console.error('='.repeat(60));
    console.error(error);
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
}

/**
 * CLI Entry Point
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  const options: DeploymentOptions = {
    dryRun: args.includes('--dry-run'),
    migrationsOnly: args.includes('--migrations-only'),
    skipBackup: args.includes('--skip-backup'),
  };

  // Check for specific tenant
  const tenantIndex = args.indexOf('--tenant');
  if (tenantIndex >= 0 && args[tenantIndex + 1]) {
    options.specificTenant = args[tenantIndex + 1];
  }

  deployToAllTenants(options);
}
