# Tamil Nadu GeoJSON Data

## Current Status
This directory contains **simplified placeholder** GeoJSON files for demonstration purposes. For production use, replace these with high-resolution boundary data.

## Where to Get Real Data

### 1. **DataMeet India Maps** (Recommended)
- **URL**: http://projects.datameet.org/maps/
- **GitHub**: https://github.com/datameet/maps
- **Available Data**:
  - State boundaries (Tamil Nadu)
  - District boundaries (all 38 districts)
  - Assembly constituency boundaries (234 constituencies)
- **Format**: GeoJSON, TopoJSON, Shapefile
- **License**: CC BY 4.0 (Open Data)

### 2. **Election Commission of India**
- **URL**: https://eci.gov.in/
- **Data**: Official constituency boundaries
- **Format**: Shapefiles (convert to GeoJSON using QGIS or ogr2ogr)
- **Most Accurate**: Official election data

### 3. **Government of Tamil Nadu GIS**
- **URL**: https://www.tn.gov.in/
- **Contact**: Tamil Nadu State Planning Commission
- **Data**: District and taluk boundaries

### 4. **OpenStreetMap**
- **URL**: https://www.openstreetmap.org/
- **Export**: Use Overpass API to extract administrative boundaries
- **Tool**: QGIS with QuickOSM plugin

## How to Convert Shapefiles to GeoJSON

```bash
# Install GDAL (includes ogr2ogr)
brew install gdal  # macOS
sudo apt-get install gdal-bin  # Ubuntu

# Convert shapefile to GeoJSON
ogr2ogr -f GeoJSON -t_srs EPSG:4326 output.json input.shp

# Simplify geometry to reduce file size (optional)
mapshaper input.json -simplify 10% -o output-simplified.json
```

## Required Files for Full Functionality

1. **tamilnadu-state.json** - State boundary outline ✅ (placeholder)
2. **tamilnadu-districts.json** - All 38 district boundaries ⚠️ (needs real data)
3. **tamilnadu-constituencies.json** - All 234 assembly constituencies ⚠️ (needs real data)
4. **puducherry-districts.json** - 4 district boundaries ⚠️ (needs real data)
5. **puducherry-constituencies.json** - 30 assembly constituencies ⚠️ (needs real data)

## File Naming Convention

- Use lowercase with hyphens
- Include region and level: `{region}-{level}.json`
- Examples:
  - `tamilnadu-state.json`
  - `chennai-district.json`
  - `chennai-constituencies.json`

## Performance Optimization

For large GeoJSON files:

1. **Use TopoJSON** - 60-80% smaller than GeoJSON
   ```bash
   npm install -g topojson
   geo2topo input.json > output.topojson
   ```

2. **Simplify Boundaries** - Reduce coordinate precision
   ```bash
   npm install -g mapshaper
   mapshaper input.json -simplify 5% keep-shapes -o output.json
   ```

3. **Load On-Demand** - Only fetch data when needed
   ```typescript
   const data = await import(\`./geo/\${districtCode}.json\`);
   ```

## Current Placeholder Data

The existing JSON files contain simplified approximations for:
- Tamil Nadu state outline (very simplified)
- Sample districts (Chennai, Coimbatore, Madurai)

**⚠️ WARNING**: These are NOT accurate and should be replaced before production deployment!

## Next Steps

1. Download real boundary data from DataMeet or ECI
2. Convert to GeoJSON format (EPSG:4326 projection)
3. Simplify geometries for web performance
4. Replace placeholder files in this directory
5. Test boundary accuracy with known locations

## Support

For questions about GeoJSON data:
- DataMeet Community: https://groups.google.com/g/datameet
- QGIS Documentation: https://qgis.org/en/docs/
