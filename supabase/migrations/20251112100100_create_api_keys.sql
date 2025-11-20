DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_keys') THEN
        CREATE TABLE public.api_keys (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            key_name TEXT NOT NULL,
            hashed_key TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_used_at TIMESTAMPTZ
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'api_keys_user_id_fkey' AND conrelid = 'public.api_keys'::regclass
    ) THEN
        ALTER TABLE public.api_keys
        ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id);
    END IF;
END $$;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own API keys"
ON public.api_keys
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own API keys"
ON public.api_keys
FOR SELECT
USING (auth.uid() = user_id);

COMMENT ON TABLE public.api_keys IS 'Stores API keys for programmatic access.';
COMMENT ON COLUMN public.api_keys.user_id IS 'The user who owns the API key.';
COMMENT ON COLUMN public.api_keys.hashed_key IS 'The securely hashed API key.';
