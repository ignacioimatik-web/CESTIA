-- Add Lidl, Aldi, DIA, Family Cash supermarkets
insert into supermarkets (id, name, display_name, color, website, enabled) values
  ('a0000000-0000-0000-0000-000000000002', 'lidl',        'Lidl',        '#0050AA', 'https://www.lidl.es',       false),
  ('a0000000-0000-0000-0000-000000000003', 'aldi',        'Aldi',        '#0079C2', 'https://www.aldi.es',       false),
  ('a0000000-0000-0000-0000-000000000004', 'dia',         'DIA',         '#D91A21', 'https://www.dia.es',        false),
  ('a0000000-0000-0000-0000-000000000005', 'family-cash', 'Family Cash', '#E4002B', 'https://www.familycash.es', false)
on conflict (name) do nothing;
