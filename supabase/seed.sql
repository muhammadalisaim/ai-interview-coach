-- Seed starter interview roles
insert into roles (name, active) values
  ('Frontend Developer', true),
  ('Backend Developer', true),
  ('Full Stack Developer', true),
  ('Data Analyst', true),
  ('Product Manager', true),
  ('UI/UX Designer', true),
  ('Marketing Executive', true),
  ('HR & Talent Specialist', true),
  ('Customer Support Representative', true),
  ('DevOps & Cloud Engineer', true)
on conflict (name) do nothing;
