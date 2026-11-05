-- ECOFIND starter schema for Supabase. Enable PostGIS first.
create extension if not exists postgis with schema extensions;
create type public.facility_status as enum ('pending','verified','needs_review','inactive');
create type public.submission_status as enum ('pending','approved','rejected');
create table public.wilayas(id bigint generated always as identity primary key,code text unique not null,name_ar text not null,name_fr text not null,name_en text not null);
create table public.municipalities(id bigint generated always as identity primary key,wilaya_id bigint not null references public.wilayas(id),name_ar text not null,name_fr text not null,name_en text not null);
create table public.waste_categories(id bigint generated always as identity primary key,slug text unique not null,name_ar text not null,name_fr text not null,name_en text not null,active boolean not null default true);
create table public.facilities(
 id uuid primary key default gen_random_uuid(),name text not null,description text,facility_type text not null,address text not null,
 wilaya_id bigint references public.wilayas(id),municipality_id bigint references public.municipalities(id),
 location extensions.geography(point,4326) not null,status public.facility_status not null default 'pending',
 verified_at timestamptz,verified_by uuid references auth.users(id),opening_hours jsonb,contact_info jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index facilities_location_gix on public.facilities using gist(location);
create table public.facility_materials(facility_id uuid references public.facilities(id) on delete cascade,category_id bigint references public.waste_categories(id),acceptance_notes text,primary key(facility_id,category_id));
create table public.facility_submissions(
 id uuid primary key default gen_random_uuid(),submitted_by uuid references auth.users(id),proposed_name text not null,
 proposed_address text not null,proposed_location extensions.geography(point,4326),proposed_type text not null,
 proposed_materials bigint[] not null default '{}',evidence_url text,notes text,status public.submission_status not null default 'pending',
 moderator_notes text,reviewed_by uuid references auth.users(id),reviewed_at timestamptz,created_at timestamptz not null default now());
create table public.facility_verifications(id uuid primary key default gen_random_uuid(),facility_id uuid not null references public.facilities(id),moderator_id uuid references auth.users(id),previous_status public.facility_status,new_status public.facility_status not null,evidence_notes text,created_at timestamptz not null default now());
create table public.facility_reports(id uuid primary key default gen_random_uuid(),facility_id uuid not null references public.facilities(id),submitted_by uuid references auth.users(id),issue_type text not null,description text,status text not null default 'open',created_at timestamptz not null default now());
-- Public nearby search returns VERIFIED facilities only. Clamp radius to 100 km.
create or replace function public.find_nearby_facilities(user_lat float8,user_lng float8,radius_m int default 5000,category_slug text default null)
returns table(id uuid,name text,facility_type text,address text,distance_m float8,latitude float8,longitude float8)
language sql stable as $$
 select f.id,f.name,f.facility_type,f.address,
 extensions.st_distance(f.location,extensions.st_setsrid(extensions.st_makepoint(user_lng,user_lat),4326)::extensions.geography),
 extensions.st_y(f.location::extensions.geometry),extensions.st_x(f.location::extensions.geometry)
 from public.facilities f where f.status='verified'
 and extensions.st_dwithin(f.location,extensions.st_setsrid(extensions.st_makepoint(user_lng,user_lat),4326)::extensions.geography,least(greatest(radius_m,250),100000))
 and (category_slug is null or exists(select 1 from public.facility_materials fm join public.waste_categories wc on wc.id=fm.category_id where fm.facility_id=f.id and wc.slug=category_slug and wc.active))
 order by 5;
$$;
-- Before production: enable RLS on all tables. Citizens may insert submissions/reports only.
-- Moderator approval and verification writes must be server-authorized; never trust browser-supplied roles.
