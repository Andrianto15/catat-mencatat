-- Alter motor_services to make current_km nullable (optional)
ALTER TABLE public.motor_services ALTER COLUMN current_km DROP NOT NULL;
ALTER TABLE public.motor_services ALTER COLUMN current_km SET DEFAULT NULL;

