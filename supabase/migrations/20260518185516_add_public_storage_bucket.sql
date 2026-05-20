insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do nothing;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'public' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'public' );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'public' );
