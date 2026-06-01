-- Add raw_data JSONB to supermarket_products for storing API response snapshots
alter table supermarket_products add column if not exists raw_data jsonb;

-- Add last_synced_at to supermarkets to track when catalog was last imported
alter table supermarkets add column if not exists last_synced_at timestamptz;
