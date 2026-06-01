create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $function$
begin
  if to_jsonb(new) ? 'updated_at' then
    new := jsonb_populate_record(new, jsonb_build_object('updated_at', now()));
  end if;
  return new;
end;
$function$;
