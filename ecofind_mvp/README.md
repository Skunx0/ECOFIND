# ECOFIND MVP

## Run locally
1. Install Node.js LTS.
2. Extract the ZIP and open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev` and open the local Vite URL.

## Included
- Responsive React + Vite interface
- Leaflet map and synchronized results list
- Material, wilaya, search and radius controls
- Clearly labelled verification states
- Citizen location suggestion form UI
- Supabase/PostGIS schema starter

## Prototype limitations
- The three map locations are fictional demonstration records, not real recycling facilities.
- The submission form is UI-only and does not save data.
- Radius is currently a display/control value; live geospatial filtering needs GPS and Supabase integration.
- Only a sample of wilayas appears in the UI selector.
- Authentication, photo storage, moderation backend and production RLS policies are not connected.

## Before launch
Create a Supabase project, enable PostGIS, run `supabase/schema.sql`, seed the official wilaya/municipality list, implement authentication and secure RLS, then replace all demo records with verified facility data.
