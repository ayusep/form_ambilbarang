--
-- PostgreSQL database dump
--

\restrict H0btOiTGXr5pZVu4OR0MyayuoeQChJI9p6QxT1ENsA3zdQanPPdawDM29bBWTy4

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-12 18:35:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 871 (class 1247 OID 32779)
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'admin',
    'manager',
    'logistik',
    'operasional'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 27010)
-- Name: barang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barang (
    id_barang integer NOT NULL,
    kode_sap character varying(50),
    nama_barang character varying(255) NOT NULL,
    harga_sap numeric(15,2) DEFAULT 0.00,
    stok integer DEFAULT 0,
    satuan character varying(20) DEFAULT 'Pcs'::character varying
);


ALTER TABLE public.barang OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 27009)
-- Name: barang_id_barang_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.barang_id_barang_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.barang_id_barang_seq OWNER TO postgres;

--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 223
-- Name: barang_id_barang_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.barang_id_barang_seq OWNED BY public.barang.id_barang;


--
-- TOC entry 229 (class 1259 OID 32861)
-- Name: coa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coa (
    id_coa integer NOT NULL,
    id_departemen integer,
    coa character varying(50) NOT NULL,
    contoh character varying(255)
);


ALTER TABLE public.coa OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 26985)
-- Name: departemen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departemen (
    id_departemen integer NOT NULL,
    nama_departemen character varying(100) NOT NULL,
    limit_budget_pinjam numeric(15,2) DEFAULT 0.00
);


ALTER TABLE public.departemen OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 26984)
-- Name: departemen_id_departemen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departemen_id_departemen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departemen_id_departemen_seq OWNER TO postgres;

--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 219
-- Name: departemen_id_departemen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departemen_id_departemen_seq OWNED BY public.departemen.id_departemen;


--
-- TOC entry 228 (class 1259 OID 32853)
-- Name: mesin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesin (
    id_mesin integer NOT NULL,
    nama_mesin character varying(100) NOT NULL,
    stok integer DEFAULT 0
);


ALTER TABLE public.mesin OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 27023)
-- Name: permintaan_barang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permintaan_barang (
    no_fab integer CONSTRAINT permintaan_barang_id_permintaan_not_null NOT NULL,
    tgl_permintaan timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_barang integer,
    id_user integer,
    qty integer NOT NULL,
    status_approval character varying(20) DEFAULT 'pending'::character varying,
    keterangan character varying(100),
    id_permintaan integer CONSTRAINT permintaan_barang_id_permintaan_not_null1 NOT NULL,
    mesin character varying(100),
    operator_maintenance character varying(100),
    coa character varying(50)
);


ALTER TABLE public.permintaan_barang OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 27022)
-- Name: permintaan_barang_id_permintaan_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permintaan_barang_id_permintaan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permintaan_barang_id_permintaan_seq OWNER TO postgres;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 225
-- Name: permintaan_barang_id_permintaan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permintaan_barang_id_permintaan_seq OWNED BY public.permintaan_barang.no_fab;


--
-- TOC entry 227 (class 1259 OID 27055)
-- Name: permintaan_barang_id_permintaan_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permintaan_barang_id_permintaan_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permintaan_barang_id_permintaan_seq1 OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 227
-- Name: permintaan_barang_id_permintaan_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permintaan_barang_id_permintaan_seq1 OWNED BY public.permintaan_barang.id_permintaan;


--
-- TOC entry 222 (class 1259 OID 26995)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id_user integer NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role_enum NOT NULL,
    id_departemen integer,
    no_telp character varying(15),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('operasional'::character varying)::text, ('manager'::character varying)::text, ('logistik'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 26994)
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_user_seq OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_user_seq OWNED BY public.users.id_user;


--
-- TOC entry 4785 (class 2604 OID 27013)
-- Name: barang id_barang; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barang ALTER COLUMN id_barang SET DEFAULT nextval('public.barang_id_barang_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 26988)
-- Name: departemen id_departemen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departemen ALTER COLUMN id_departemen SET DEFAULT nextval('public.departemen_id_departemen_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 27026)
-- Name: permintaan_barang no_fab; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_barang ALTER COLUMN no_fab SET DEFAULT nextval('public.permintaan_barang_id_permintaan_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 27056)
-- Name: permintaan_barang id_permintaan; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_barang ALTER COLUMN id_permintaan SET DEFAULT nextval('public.permintaan_barang_id_permintaan_seq1'::regclass);


--
-- TOC entry 4784 (class 2604 OID 26998)
-- Name: users id_user; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id_user SET DEFAULT nextval('public.users_id_user_seq'::regclass);


--
-- TOC entry 4970 (class 0 OID 27010)
-- Dependencies: 224
-- Data for Name: barang; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barang (id_barang, kode_sap, nama_barang, harga_sap, stok, satuan) FROM stdin;
1	MAT-1001	Laptop Dell Latitude 5420	15000000.00	25	Pcs
2	MAT-1002	Monitor LG 24 Inch IPS	25000000.00	40	Pcs
3	MAT-1003	Keyboard Logitech K120	150000.00	100	Pcs
4	MAT-1004	Mouse Wireless M185	200000.00	85	Pcs
5	MAT-2001	Tinta Printer HP Black	350000.00	15	Pcs
6	MAT-2002	Kertas A4 80gr (Rim)	55000.00	500	Pcs
7	MAT-3001	Meja Kantor Standard	1200000.00	10	Pcs
8	MAT-3002	Kursi Ergononimic Staff	850000.00	20	Pcs
\.


--
-- TOC entry 4975 (class 0 OID 32861)
-- Dependencies: 229
-- Data for Name: coa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coa (id_coa, id_departemen, coa, contoh) FROM stdin;
\.


--
-- TOC entry 4966 (class 0 OID 26985)
-- Dependencies: 220
-- Data for Name: departemen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departemen (id_departemen, nama_departemen, limit_budget_pinjam) FROM stdin;
3	PRM	30000000.00
7	PRODUKSI	15000000.00
8	GUDANG	25000000.00
9	MAINTENANCE	50000000.00
10	KEUANGAN	40000000.00
1	IT Support	50000000.00
2	Marketing	40000000.00
\.


--
-- TOC entry 4974 (class 0 OID 32853)
-- Dependencies: 228
-- Data for Name: mesin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mesin (id_mesin, nama_mesin, stok) FROM stdin;
\.


--
-- TOC entry 4972 (class 0 OID 27023)
-- Dependencies: 226
-- Data for Name: permintaan_barang; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permintaan_barang (no_fab, tgl_permintaan, id_barang, id_user, qty, status_approval, keterangan, id_permintaan, mesin, operator_maintenance, coa) FROM stdin;
260301	2026-03-10 10:35:50.093911	8	7	1	Closed	\N	1	de	dwe	ede
260302	2026-03-11 08:40:52.375911	3	7	1	Rejected	Belum butuh	2	de	dew	ddddddd
260304	2026-03-11 08:45:16.345486	3	7	1	Pending	\N	4	yu	tu	g
260303	2026-03-11 08:43:18.889305	3	7	1	Approved	\N	3	gr	ag	ga
260305	2026-03-11 09:16:56.621141	3	5	1	Rejected	belum butuh	5	tee	w	twe
260306	2026-03-11 14:35:25.941355	3	5	1	Rejected	belum butuh	6	fg	gf	gd
\.


--
-- TOC entry 4968 (class 0 OID 26995)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id_user, nama, email, password, role, id_departemen, no_telp) FROM stdin;
1	Admin	admin@bbp.com	47dd90dd1d0d0aececc3f12c52f005d5:24baf47ffe5c9a48abd7f2d13b2ca07a4e6efda372ffbf6178134222d121f75abd56dc3011e6a748058b52f15ab4c4d8c23a34d9cc21b275c4de8d05598d1680	admin	1	081234567890
2	Agus	agus@bbp.com	6e2b61c833f4cb5219dc1fab5a9588d7:186e8093c4f0cca3aeb08b95ad29ff8fab065fe9324c1e5370b7f154d993ec274f2634f346313d0e19b746aa6202d411450bb1df6fcc80af5919e32652e59666	operasional	1	081234567891
3	Adam	adam@bbp.com	09095df2db9ab8c72f62867150cd6c67:d31299f0690d0863733df3bab5e735286db2f6fc552c2724e3244a388ee6eae482ccbe28426dca2b88e2982139394e1296f7e8ecb8e4cd3f853a59f47e70e33b	logistik	8	081234567892
4	Anton	anton@bbp.com	d54dd0faac9048f1472fd3db5eab2316:0b97f2bafd2b497c54aa4198b1965ec8392d9786a4bee566bd8053c2d6239fd881d5734ead866559dce68473b51b4f1ab32113f47d37cc6253111ec9c93e5f0c	manager	1	081234567893
5	Arin	arin@bbp.com	ea702851509ed64d7554e2f2d418937a:6fed238ac3352959769dd90fdb3162de13c5ce707ba2903d8fe4e25b52d75fe0d582225907309ec5cc80b0cd65b7ace915158fa6672e7b3975d5632b5bac9f42	operasional	2	087693871234
6	Vio	vio@bbp.com	b23d53db064a0cd955869bc29158dce9:f5356e7201b74fb6d4e9228c429fadb93dcfbe6897c82b2958d8b6b2e15b7245e5da4f9a83a33f9c5a0596a08ac1900885fd5f0fdff949a4a87ff351d3440f45	manager	2	083426781395
7	Nay	nay@bbp.com	6ed4468083ce2963ffcc7768cbc36b65:83266f7e3471fbf6b3474f178afd957380331dc97b71b8ba111204b423de7a827d76bf399135fe71ede37c24dceb425d0090a43ce3c1cedb9b66b3fa582d07b8	operasional	7	089723678432
8	Martin	martin@bbp.com	15450b1747c9c09f065c07451b3c3378:07216dae1b83a3118e255ce1d725bdfdc50b00d98391b19721558ab123a3b366af68e586bc5f60e09390043f44716f4645fe1dd69d0069ab18ff2be2956b5034	manager	7	089051386901
\.


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 223
-- Name: barang_id_barang_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.barang_id_barang_seq', 8, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 219
-- Name: departemen_id_departemen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departemen_id_departemen_seq', 10, true);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 225
-- Name: permintaan_barang_id_permintaan_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permintaan_barang_id_permintaan_seq', 1, false);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 227
-- Name: permintaan_barang_id_permintaan_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permintaan_barang_id_permintaan_seq1', 6, true);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_user_seq', 8, true);


--
-- TOC entry 4806 (class 2606 OID 27021)
-- Name: barang barang_kode_sap_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_kode_sap_key UNIQUE (kode_sap);


--
-- TOC entry 4808 (class 2606 OID 27019)
-- Name: barang barang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barang
    ADD CONSTRAINT barang_pkey PRIMARY KEY (id_barang);


--
-- TOC entry 4814 (class 2606 OID 32867)
-- Name: coa coa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coa
    ADD CONSTRAINT coa_pkey PRIMARY KEY (id_coa);


--
-- TOC entry 4796 (class 2606 OID 26993)
-- Name: departemen departemen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departemen
    ADD CONSTRAINT departemen_pkey PRIMARY KEY (id_departemen);


--
-- TOC entry 4812 (class 2606 OID 32860)
-- Name: mesin mesin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesin
    ADD CONSTRAINT mesin_pkey PRIMARY KEY (id_mesin);


--
-- TOC entry 4810 (class 2606 OID 27059)
-- Name: permintaan_barang permintaan_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_barang
    ADD CONSTRAINT permintaan_barang_pkey PRIMARY KEY (id_permintaan);


--
-- TOC entry 4798 (class 2606 OID 27090)
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 4800 (class 2606 OID 27092)
-- Name: users unique_no_telp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_no_telp UNIQUE (no_telp);


--
-- TOC entry 4802 (class 2606 OID 27008)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4804 (class 2606 OID 27006)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- TOC entry 4815 (class 2606 OID 27043)
-- Name: users fk_users_departemen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_departemen FOREIGN KEY (id_departemen) REFERENCES public.departemen(id_departemen) ON DELETE SET NULL;


--
-- TOC entry 4816 (class 2606 OID 27033)
-- Name: permintaan_barang permintaan_barang_id_barang_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_barang
    ADD CONSTRAINT permintaan_barang_id_barang_fkey FOREIGN KEY (id_barang) REFERENCES public.barang(id_barang) ON DELETE CASCADE;


--
-- TOC entry 4817 (class 2606 OID 27038)
-- Name: permintaan_barang permintaan_barang_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_barang
    ADD CONSTRAINT permintaan_barang_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.users(id_user);


-- Completed on 2026-03-12 18:35:33

--
-- PostgreSQL database dump complete
--

\unrestrict H0btOiTGXr5pZVu4OR0MyayuoeQChJI9p6QxT1ENsA3zdQanPPdawDM29bBWTy4

