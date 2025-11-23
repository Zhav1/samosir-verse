-- Allow public write access for development/seeding
CREATE POLICY "Allow public insert on nodes" ON nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on nodes" ON nodes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on nodes" ON nodes FOR DELETE USING (true);

CREATE POLICY "Allow public insert on landmarks" ON landmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on landmarks" ON landmarks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on landmarks" ON landmarks FOR DELETE USING (true);
