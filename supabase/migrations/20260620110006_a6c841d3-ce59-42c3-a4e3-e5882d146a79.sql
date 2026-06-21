
CREATE POLICY "kyc_owner_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer')));

CREATE POLICY "kyc_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "kyc_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'kyc' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "kyc_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'kyc' AND auth.uid()::text = (storage.foldername(name))[1]);
