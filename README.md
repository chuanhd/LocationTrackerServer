# LocationTracker
Install Node.js
  brew install node
  node -v
  npm -v
Install postgres
  https://www.postgresql.org/ftp/pgadmin3/release/v1.8.4/osx/
  port 5432
  https://www.enterprisedb.com/downloads/postgres-postgresql-downloads#macosx
  postgresql 9.5
  user: postgres
  pass: 1
path/to/folder npm install
npm start

Create database:
CREATE DATABASE "LocationTracker"
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'C'
       LC_CTYPE = 'C'
       CONNECTION LIMIT = -1;
       
Create table:

CREATE TABLE public.userprofile
(
  userid serial NOT NULL,
  deviceid character varying(50),
  username character varying(80),
  userimage character varying(100),
  email character varying(80),
  lat double precision,
  lon double precision,
  phonenumber character varying(20),
  CONSTRAINT userprofile_pkey PRIMARY KEY (userid)
);

CREATE TABLE public.grouplist
(
  groupid serial NOT NULL,
  groupname character varying(80),
  description character varying(250),
  usercreate character(50),
  CONSTRAINT grouplist_pkey PRIMARY KEY (groupid)
);

CREATE TABLE public.groupmember
(
  id serial NOT NULL ,
  groupid integer,
  userid integer,
  CONSTRAINT groupmember_pkey PRIMARY KEY (id)
);

CREATE TABLE public.imagesupload
(
  imageid serial NOT NULL ,
  url character varying(1000),
  lat double precision,
  lon double precision,
  userid integer NOT NULL,
  CONSTRAINT imagesupload_pkey PRIMARY KEY (imageid)
);
