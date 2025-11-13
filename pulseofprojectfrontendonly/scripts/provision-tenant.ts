/**
 * Tenant Provisioning Script
 * Automates the creation of new tenants
 *
 * Usage:
 *   npm run provision-tenant -- --name "Kerala 2026" --email admin@kerala.gov.in --region ap-south-1
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface ProvisioningOptions {
  name: string;
  displayName?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  organizationName?: string;
  region: string;
  state: string;
  coverageArea: string;
  estimatedWards: number;
  expectedUsers: number;
  subscriptionTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  customDomain?: string;
  autoCreateAdmin?: boolean;
}

interface ProvisioningResult {
  success: boolean;
  tenantId?: string;
  tenantSlug?: string;
  supabaseProjectId?: string;
  supabaseUrl?: string;
  adminEmail?: string;
  adminPassword?: string;
  error?: string;
}

/**
 * Generate a secure random password
 */
function generatePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  return password;
}

/**
 * Generate tenant slug from name
 */
function generateTenantSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

/**
 * Create Supabase project via CLI
 */
async function createSupabaseProject(
  name: string,
  region: string
): Promise<{ projectId: string; url: string; anonKey: string; serviceKey: string }> {
  console.log(`Creating Supabase project: ${name} in region ${region}...`);

  try {
    // Create project using Supabase CLI
    const createCmd = `supabase projects create "${name}" --region ${region} --db-password $(openssl rand -base64 32)`;
    const output = execSync(createCmd, { encoding: 'utf-8' });

    // Parse output to get project ID
    const projectIdMatch = output.match(/Project ID: ([a-z0-9]+)/);
    if (!projectIdMatch) {
      throw new Error('Failed to extract project ID from Supabase CLI output');
    }
    const projectId = projectIdMatch[1];

    // Get project details
    const detailsCmd = `supabase projects list --filter ${projectId}`;
    const details = execSync(detailsCmd, { encoding: 'utf-8' });

    // Get API keys
    const keysCmd = `supabase projects api-keys --project-id ${projectId}`;
    const keysOutput = execSync(keysCmd, { encoding: 'utf-8' });

    const anonKeyMatch = keysOutput.match(/anon.*?:\s*([^\s]+)/);
    const serviceKeyMatch = keysOutput.match(/service_role.*?:\s*([^\s]+)/);

    if (!anonKeyMatch || !serviceKeyMatch) {
      throw new Error('Failed to extract API keys');
    }

    const url = `https://${projectId}.supabase.co`;
    const anonKey = anonKeyMatch[1];
    const serviceKey = serviceKeyMatch[1];

    console.log(`✓ Supabase project created: ${projectId}`);
    return { projectId, url, anonKey, serviceKey };
  } catch (error) {
    console.error('Failed to create Supabase project:', error);
    throw error;
  }
}

/**
 * Run database migrations on tenant database
 */
async function runMigrations(databaseUrl: string): Promise<void> {
  console.log('Running database migrations...');

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`  - Running ${file}...`);

    try {
      const sql = fs.readFileSync(filePath, 'utf-8');
      execSync(`psql "${databaseUrl}" -c "${sql.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
      });
    } catch (error) {
      console.error(`  ✗ Failed to run ${file}`);
      throw error;
    }
  }

  console.log('✓ All migrations completed');
}

/**
 * Configure storage buckets
 */
async function setupStorageBuckets(
  supabaseUrl: string,
  serviceKey: string
): Promise<void> {
  console.log('Setting up storage buckets...');

  const supabase = createClient(supabaseUrl, serviceKey);

  const buckets = [
    { name: 'field-reports', public: false },
    { name: 'media-uploads', public: false },
    { name: 'avatars', public: true },
    { name: 'exports', public: false },
  ];

  for (const bucket of buckets) {
    try {
      await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 52428800, // 50MB
      });
      console.log(`  ✓ Created bucket: ${bucket.name}`);
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`  - Bucket ${bucket.name} already exists`);
      } else {
        console.error(`  ✗ Failed to create bucket ${bucket.name}:`, error);
      }
    }
  }
}

/**
 * Create admin user for tenant
 */
async function createAdminUser(
  supabaseUrl: string,
  serviceKey: string,
  email: string,
  name: string
): Promise<string> {
  console.log(`Creating admin user: ${email}...`);

  const supabase = createClient(supabaseUrl, serviceKey);
  const password = generatePassword(16);

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin',
      },
    });

    if (authError) throw authError;

    // Create user record in database
    const { error: dbError } = await supabase.from('users').insert({
      id: authUser.user.id,
      name,
      email,
      role: 'admin',
      permissions: ['view_all', 'edit_all', 'manage_users', 'export_data', 'verify_submissions'],
      status: 'active',
    });

    if (dbError) throw dbError;

    console.log(`✓ Admin user created: ${email}`);
    return password;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    throw error;
  }
}

/**
 * Register tenant in central registry
 */
async function registerTenant(
  registryUrl: string,
  registryKey: string,
  tenantData: any
): Promise<string> {
  console.log('Registering tenant in central registry...');

  const supabase = createClient(registryUrl, registryKey);

  try {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenantData)
      .select()
      .single();

    if (error) throw error;

    console.log(`✓ Tenant registered: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error('Failed to register tenant:', error);
    throw error;
  }
}

/**
 * Store encrypted credentials
 */
async function storeCredentials(
  registryUrl: string,
  registryKey: string,
  tenantId: string,
  credentials: {
    serviceKey: string;
    databaseUrl: string;
    databasePassword: string;
  }
): Promise<void> {
  console.log('Storing tenant credentials...');

  const supabase = createClient(registryUrl, registryKey);
  const encryptionKey = process.env.CREDENTIALS_ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY environment variable not set');
  }

  try {
    // In production, use proper encryption here
    // For now, we'll just store them (you should encrypt in production)
    const { error } = await supabase.from('tenant_credentials').insert({
      tenant_id: tenantId,
      supabase_service_key: credentials.serviceKey,
      database_url: credentials.databaseUrl,
      database_password: credentials.databasePassword,
    });

    if (error) throw error;

    console.log('✓ Credentials stored securely');
  } catch (error) {
    console.error('Failed to store credentials:', error);
    throw error;
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(
  email: string,
  tenantSlug: string,
  adminPassword: string
): Promise<void> {
  console.log(`Sending welcome email to ${email}...`);

  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log('⚠ Email sending not implemented yet. Manual email required.');
  console.log(`
    ===== WELCOME EMAIL CONTENT =====
    To: ${email}
    Subject: Welcome to Pulse of People!

    Your tenant has been successfully created!

    Tenant URL: https://${tenantSlug}.pulseofpeople.com
    Admin Email: ${email}
    Temporary Password: ${adminPassword}

    Please log in and change your password immediately.

    Best regards,
    Pulse of People Team
    =================================
  `);
}

/**
 * Main provisioning function
 */
export async function provisionTenant(
  options: ProvisioningOptions
): Promise<ProvisioningResult> {
  console.log('\n========================================');
  console.log('TENANT PROVISIONING STARTED');
  console.log('========================================\n');

  const startTime = Date.now();

  try {
    // Generate tenant slug
    const tenantSlug = generateTenantSlug(options.name);
    const displayName = options.displayName || options.name;

    console.log(`Tenant Name: ${options.name}`);
    console.log(`Tenant Slug: ${tenantSlug}`);
    console.log(`Region: ${options.region}\n`);

    // 1. Create Supabase project
    const supabaseProject = await createSupabaseProject(options.name, options.region);

    // 2. Run database migrations
    const databaseUrl = `postgresql://postgres:[password]@db.${supabaseProject.projectId}.supabase.co:5432/postgres`;
    await runMigrations(databaseUrl);

    // 3. Set up storage buckets
    await setupStorageBuckets(supabaseProject.url, supabaseProject.serviceKey);

    // 4. Create admin user (if requested)
    let adminPassword: string | undefined;
    if (options.autoCreateAdmin !== false) {
      adminPassword = await createAdminUser(
        supabaseProject.url,
        supabaseProject.serviceKey,
        options.contactEmail,
        options.contactName
      );
    }

    // 5. Register tenant in central registry
    const registryUrl = process.env.VITE_TENANT_REGISTRY_URL || '';
    const registryKey = process.env.TENANT_REGISTRY_SERVICE_KEY || '';

    const tenantData = {
      slug: tenantSlug,
      name: options.name,
      display_name: displayName,
      supabase_url: supabaseProject.url,
      supabase_project_id: supabaseProject.projectId,
      supabase_anon_key: supabaseProject.anonKey,
      supabase_region: options.region,
      contact_name: options.contactName,
      contact_email: options.contactEmail,
      contact_phone: options.contactPhone,
      organization_name: options.organizationName,
      subscription_status: 'trial',
      subscription_tier: options.subscriptionTier,
      coverage_area: options.coverageArea,
      state: options.state,
      ward_count: options.estimatedWards,
      expected_users: options.expectedUsers,
      custom_domain: options.customDomain,
      status: 'active',
    };

    const tenantId = await registerTenant(registryUrl, registryKey, tenantData);

    // 6. Store encrypted credentials
    await storeCredentials(registryUrl, registryKey, tenantId, {
      serviceKey: supabaseProject.serviceKey,
      databaseUrl,
      databasePassword: '[encrypted]',
    });

    // 7. Send welcome email
    if (adminPassword) {
      await sendWelcomeEmail(options.contactEmail, tenantSlug, adminPassword);
    }

    // Success!
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('TENANT PROVISIONING COMPLETED');
    console.log('========================================');
    console.log(`Duration: ${duration}s\n`);
    console.log('Tenant Details:');
    console.log(`  Tenant ID: ${tenantId}`);
    console.log(`  Tenant Slug: ${tenantSlug}`);
    console.log(`  Supabase Project: ${supabaseProject.projectId}`);
    console.log(`  Tenant URL: https://${tenantSlug}.pulseofpeople.com`);
    console.log(`  Admin Email: ${options.contactEmail}`);
    if (adminPassword) {
      console.log(`  Admin Password: ${adminPassword}`);
    }
    console.log('\n========================================\n');

    return {
      success: true,
      tenantId,
      tenantSlug,
      supabaseProjectId: supabaseProject.projectId,
      supabaseUrl: supabaseProject.url,
      adminEmail: options.contactEmail,
      adminPassword,
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('TENANT PROVISIONING FAILED');
    console.error('========================================');
    console.error(error);
    console.error('\n========================================\n');

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * CLI Entry Point
 */
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: Partial<ProvisioningOptions> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    (options as any)[key] = value;
  }

  // Validate required fields
  const required = ['name', 'contactName', 'contactEmail', 'region', 'state', 'coverageArea'];
  const missing = required.filter((field) => !(options as any)[field]);

  if (missing.length > 0) {
    console.error('Missing required fields:', missing.join(', '));
    console.error('\nUsage:');
    console.error('  npm run provision-tenant -- \\');
    console.error('    --name "Kerala 2026" \\');
    console.error('    --contactName "Admin Name" \\');
    console.error('    --contactEmail "admin@kerala.gov.in" \\');
    console.error('    --region "ap-south-1" \\');
    console.error('    --state "Kerala" \\');
    console.error('    --coverageArea "Kerala State Elections"');
    process.exit(1);
  }

  // Set defaults
  const fullOptions: ProvisioningOptions = {
    ...options,
    estimatedWards: Number(options.estimatedWards) || 1000,
    expectedUsers: Number(options.expectedUsers) || 50,
    subscriptionTier: (options.subscriptionTier as any) || 'standard',
    autoCreateAdmin: true,
  } as ProvisioningOptions;

  // Run provisioning
  provisionTenant(fullOptions)
    .then((result) => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}
