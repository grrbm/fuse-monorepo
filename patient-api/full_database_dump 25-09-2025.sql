--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

-- Started on 2025-09-25 20:33:27 UTC

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

DROP DATABASE fusehealth_database;
--
-- TOC entry 5813 (class 1262 OID 16477)
-- Name: fusehealth_database; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE fusehealth_database WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';


ALTER DATABASE fusehealth_database OWNER TO postgres;

\connect fusehealth_database

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
-- TOC entry 968 (class 1247 OID 102528)
-- Name: enum_BrandSubscriptionPlans_planType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_BrandSubscriptionPlans_planType" AS ENUM (
    'starter',
    'professional',
    'enterprise'
);


ALTER TYPE public."enum_BrandSubscriptionPlans_planType" OWNER TO fusehealth_user;

--
-- TOC entry 971 (class 1247 OID 108063)
-- Name: enum_BrandSubscription_planType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_BrandSubscription_planType" AS ENUM (
    'starter',
    'professional',
    'enterprise'
);


ALTER TYPE public."enum_BrandSubscription_planType" OWNER TO fusehealth_user;

--
-- TOC entry 965 (class 1247 OID 99838)
-- Name: enum_BrandSubscription_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_BrandSubscription_status" AS ENUM (
    'pending',
    'processing',
    'active',
    'payment_due',
    'cancelled',
    'past_due'
);


ALTER TYPE public."enum_BrandSubscription_status" OWNER TO fusehealth_user;

--
-- TOC entry 941 (class 1247 OID 40342)
-- Name: enum_Clinic_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Clinic_status" AS ENUM (
    'pending',
    'paid',
    'payment_due',
    'cancelled'
);


ALTER TYPE public."enum_Clinic_status" OWNER TO fusehealth_user;

--
-- TOC entry 962 (class 1247 OID 64411)
-- Name: enum_Order_billingInterval; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Order_billingInterval" AS ENUM (
    'monthly',
    'quarterly',
    'biannual',
    'annual'
);


ALTER TYPE public."enum_Order_billingInterval" OWNER TO fusehealth_user;

--
-- TOC entry 920 (class 1247 OID 30720)
-- Name: enum_Order_billingPlan; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Order_billingPlan" AS ENUM (
    'monthly',
    'quarterly',
    'biannual'
);


ALTER TYPE public."enum_Order_billingPlan" OWNER TO fusehealth_user;

--
-- TOC entry 917 (class 1247 OID 30703)
-- Name: enum_Order_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Order_status" AS ENUM (
    'pending',
    'payment_processing',
    'paid',
    'payment_due',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);


ALTER TYPE public."enum_Order_status" OWNER TO fusehealth_user;

--
-- TOC entry 932 (class 1247 OID 30788)
-- Name: enum_Payment_paymentMethod; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Payment_paymentMethod" AS ENUM (
    'card',
    'bank_transfer',
    'digital_wallet'
);


ALTER TYPE public."enum_Payment_paymentMethod" OWNER TO fusehealth_user;

--
-- TOC entry 929 (class 1247 OID 30773)
-- Name: enum_Payment_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Payment_status" AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
);


ALTER TYPE public."enum_Payment_status" OWNER TO fusehealth_user;

--
-- TOC entry 908 (class 1247 OID 24344)
-- Name: enum_Question_answerType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Question_answerType" AS ENUM (
    'text',
    'number',
    'email',
    'phone',
    'date',
    'checkbox',
    'radio',
    'select',
    'textarea',
    'height',
    'weight'
);


ALTER TYPE public."enum_Question_answerType" OWNER TO fusehealth_user;

--
-- TOC entry 944 (class 1247 OID 40941)
-- Name: enum_ShippingOrder_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_ShippingOrder_status" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE public."enum_ShippingOrder_status" OWNER TO fusehealth_user;

--
-- TOC entry 950 (class 1247 OID 40965)
-- Name: enum_Subscription_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Subscription_status" AS ENUM (
    'pending',
    'processing',
    'paid',
    'payment_due',
    'cancelled'
);


ALTER TYPE public."enum_Subscription_status" OWNER TO fusehealth_user;

--
-- TOC entry 956 (class 1247 OID 50748)
-- Name: enum_TreatmentPlan_billingInterval; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_TreatmentPlan_billingInterval" AS ENUM (
    'monthly',
    'quarterly',
    'biannual',
    'annual'
);


ALTER TYPE public."enum_TreatmentPlan_billingInterval" OWNER TO fusehealth_user;

--
-- TOC entry 875 (class 1247 OID 16700)
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public.enum_users_role AS ENUM (
    'patient',
    'doctor',
    'admin',
    'brand'
);


ALTER TYPE public.enum_users_role OWNER TO fusehealth_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 111282)
-- Name: BrandSubscription; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."BrandSubscription" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "userId" uuid NOT NULL,
    "planType" character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "stripeSubscriptionId" character varying(255),
    "stripeCustomerId" character varying(255),
    "stripePriceId" character varying(255),
    "monthlyPrice" numeric(10,2) NOT NULL,
    "currentPeriodStart" timestamp with time zone,
    "currentPeriodEnd" timestamp with time zone,
    "cancelledAt" timestamp with time zone,
    "paymentDue" timestamp with time zone,
    "trialStart" timestamp with time zone,
    "trialEnd" timestamp with time zone,
    features jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."BrandSubscription" OWNER TO fusehealth_user;

--
-- TOC entry 239 (class 1259 OID 111405)
-- Name: BrandSubscriptionPlans; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."BrandSubscriptionPlans" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "planType" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "monthlyPrice" numeric(10,2) NOT NULL,
    "stripePriceId" character varying(255) NOT NULL,
    "maxProducts" integer DEFAULT '-1'::integer NOT NULL,
    "maxCampaigns" integer DEFAULT '-1'::integer NOT NULL,
    "analyticsAccess" boolean DEFAULT true NOT NULL,
    "customerSupport" character varying(255) DEFAULT 'email'::character varying NOT NULL,
    "customBranding" boolean DEFAULT false NOT NULL,
    "apiAccess" boolean DEFAULT false NOT NULL,
    "whiteLabel" boolean DEFAULT false NOT NULL,
    "customIntegrations" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."BrandSubscriptionPlans" OWNER TO fusehealth_user;

--
-- TOC entry 226 (class 1259 OID 16862)
-- Name: Clinic; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Clinic" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    slug character varying(255) NOT NULL,
    logo text NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    active boolean DEFAULT false NOT NULL,
    status public."enum_Clinic_status" DEFAULT 'pending'::public."enum_Clinic_status" NOT NULL,
    website character varying(255),
    address character varying(255),
    city character varying(255),
    state character varying(255),
    "zipCode" character varying(255)
);


ALTER TABLE public."Clinic" OWNER TO fusehealth_user;

--
-- TOC entry 220 (class 1259 OID 16717)
-- Name: Entity; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Entity" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Entity" OWNER TO fusehealth_user;

--
-- TOC entry 231 (class 1259 OID 30727)
-- Name: Order; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Order" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderNumber" character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "treatmentId" uuid NOT NULL,
    "questionnaireId" uuid,
    status public."enum_Order_status" DEFAULT 'pending'::public."enum_Order_status" NOT NULL,
    "subtotalAmount" numeric(10,2) NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "shippingAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    notes text,
    "questionnaireAnswers" jsonb,
    "shippedAt" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "treatmentPlanId" uuid,
    "billingInterval" public."enum_Order_billingInterval",
    "paymentIntentId" character varying(255),
    "shippingAddressId" uuid,
    "physicianId" uuid
);


ALTER TABLE public."Order" OWNER TO fusehealth_user;

--
-- TOC entry 232 (class 1259 OID 30755)
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."OrderItem" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    dosage character varying(255),
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pharmacyProductId" character varying(255)
);


ALTER TABLE public."OrderItem" OWNER TO fusehealth_user;

--
-- TOC entry 233 (class 1259 OID 30795)
-- Name: Payment; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Payment" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderId" uuid NOT NULL,
    "stripePaymentIntentId" character varying(255) NOT NULL,
    status public."enum_Payment_status" DEFAULT 'pending'::public."enum_Payment_status" NOT NULL,
    "paymentMethod" public."enum_Payment_paymentMethod" DEFAULT 'card'::public."enum_Payment_paymentMethod" NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    "refundedAmount" numeric(10,2),
    "stripeChargeId" character varying(255),
    "stripeCustomerId" character varying(255),
    "lastFourDigits" character varying(255),
    "cardBrand" character varying(255),
    "cardCountry" character varying(255),
    "stripeMetadata" jsonb,
    "failureReason" text,
    "paidAt" timestamp with time zone,
    "refundedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO fusehealth_user;

--
-- TOC entry 240 (class 1259 OID 128583)
-- Name: Physician; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Physician" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "firstName" character varying(255) NOT NULL,
    "middleName" character varying(255),
    "lastName" character varying(255) NOT NULL,
    "phoneNumber" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    street character varying(255) NOT NULL,
    street2 character varying(255),
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    zip character varying(255) NOT NULL,
    licenses jsonb DEFAULT '[]'::jsonb NOT NULL,
    "pharmacyPhysicianId" character varying(255),
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Physician" OWNER TO fusehealth_user;

--
-- TOC entry 222 (class 1259 OID 16729)
-- Name: Prescription; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Prescription" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    name character varying(255) NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "writtenAt" timestamp with time zone NOT NULL,
    "patientId" uuid NOT NULL,
    "doctorId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Prescription" OWNER TO fusehealth_user;

--
-- TOC entry 224 (class 1259 OID 16749)
-- Name: PrescriptionProducts; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."PrescriptionProducts" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "prescriptionId" uuid NOT NULL,
    quantity integer NOT NULL,
    "productId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pharmacyProductId" character varying(255)
);


ALTER TABLE public."PrescriptionProducts" OWNER TO fusehealth_user;

--
-- TOC entry 221 (class 1259 OID 16722)
-- Name: Product; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Product" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    name character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    price double precision NOT NULL,
    "activeIngredients" character varying(255)[] NOT NULL,
    dosage character varying(255) NOT NULL,
    "imageUrl" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pharmacyProductId" character varying(255),
    "clinicId" uuid
);


ALTER TABLE public."Product" OWNER TO fusehealth_user;

--
-- TOC entry 229 (class 1259 OID 24367)
-- Name: Question; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Question" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "questionText" text NOT NULL,
    "answerType" public."enum_Question_answerType" NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "questionOrder" integer NOT NULL,
    placeholder text,
    "helpText" text,
    "stepId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "footerNote" text,
    "questionSubtype" text,
    "conditionalLogic" text,
    "subQuestionOrder" integer,
    "conditionalLevel" integer DEFAULT 0
);


ALTER TABLE public."Question" OWNER TO fusehealth_user;

--
-- TOC entry 230 (class 1259 OID 24380)
-- Name: QuestionOption; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."QuestionOption" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "optionText" character varying(255) NOT NULL,
    "optionValue" character varying(255),
    "optionOrder" integer NOT NULL,
    "questionId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QuestionOption" OWNER TO fusehealth_user;

--
-- TOC entry 227 (class 1259 OID 24319)
-- Name: Questionnaire; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Questionnaire" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    title character varying(255) NOT NULL,
    description text,
    "treatmentId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "checkoutStepPosition" integer DEFAULT '-1'::integer NOT NULL
);


ALTER TABLE public."Questionnaire" OWNER TO fusehealth_user;

--
-- TOC entry 228 (class 1259 OID 24331)
-- Name: QuestionnaireStep; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."QuestionnaireStep" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    title character varying(255) NOT NULL,
    description text,
    "stepOrder" integer NOT NULL,
    "questionnaireId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QuestionnaireStep" OWNER TO fusehealth_user;

--
-- TOC entry 217 (class 1259 OID 16481)
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO fusehealth_user;

--
-- TOC entry 234 (class 1259 OID 30814)
-- Name: ShippingAddress; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."ShippingAddress" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    address character varying(255) NOT NULL,
    apartment character varying(255),
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    "zipCode" character varying(255) NOT NULL,
    country character varying(2) DEFAULT 'US'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" uuid NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ShippingAddress" OWNER TO fusehealth_user;

--
-- TOC entry 235 (class 1259 OID 40951)
-- Name: ShippingOrder; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."ShippingOrder" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderId" uuid NOT NULL,
    status public."enum_ShippingOrder_status" DEFAULT 'pending'::public."enum_ShippingOrder_status" NOT NULL,
    "pharmacyOrderId" character varying(255),
    "deliveredAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "shippingAddressId" uuid NOT NULL
);


ALTER TABLE public."ShippingOrder" OWNER TO fusehealth_user;

--
-- TOC entry 236 (class 1259 OID 40975)
-- Name: Subscription; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Subscription" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "clinicId" uuid,
    "orderId" uuid,
    status public."enum_Subscription_status" DEFAULT 'pending'::public."enum_Subscription_status" NOT NULL,
    "cancelledAt" timestamp with time zone,
    "paymentDue" timestamp with time zone,
    "stripeSubscriptionId" character varying(255),
    "paidAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO fusehealth_user;

--
-- TOC entry 223 (class 1259 OID 16739)
-- Name: Treatment; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Treatment" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    name character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "clinicId" uuid NOT NULL,
    "treatmentLogo" text,
    price double precision DEFAULT '0'::double precision NOT NULL,
    "productsPrice" double precision DEFAULT '0'::double precision NOT NULL,
    active boolean DEFAULT false NOT NULL,
    "stripeProductId" character varying(255),
    "stripePriceId" character varying(255)
);


ALTER TABLE public."Treatment" OWNER TO fusehealth_user;

--
-- TOC entry 237 (class 1259 OID 50757)
-- Name: TreatmentPlan; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."TreatmentPlan" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    name character varying(255) NOT NULL,
    description text,
    "billingInterval" public."enum_TreatmentPlan_billingInterval" NOT NULL,
    "stripePriceId" character varying(255) NOT NULL,
    price double precision NOT NULL,
    active boolean DEFAULT true NOT NULL,
    popular boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "treatmentId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TreatmentPlan" OWNER TO fusehealth_user;

--
-- TOC entry 225 (class 1259 OID 16766)
-- Name: TreatmentProducts; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."TreatmentProducts" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    dosage character varying(255) NOT NULL,
    "productId" uuid NOT NULL,
    "treatmentId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TreatmentProducts" OWNER TO fusehealth_user;

--
-- TOC entry 218 (class 1259 OID 16506)
-- Name: session; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public.session (
    sid character varying(255) NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp with time zone NOT NULL
);


ALTER TABLE public.session OWNER TO fusehealth_user;

--
-- TOC entry 219 (class 1259 OID 16707)
-- Name: users; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    dob date,
    "phoneNumber" character varying(255),
    address text,
    city character varying(100),
    state character varying(50),
    "zipCode" character varying(20),
    role public.enum_users_role DEFAULT 'patient'::public.enum_users_role NOT NULL,
    "lastLoginAt" timestamp with time zone,
    "consentGivenAt" timestamp with time zone,
    "emergencyContact" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "clinicId" uuid,
    "pharmacyPatientId" character varying(255),
    gender character varying(255),
    allergies json,
    diseases json,
    medications json,
    "stripeCustomerId" character varying(255),
    activated boolean DEFAULT false NOT NULL,
    "activationToken" character varying(255),
    "activationTokenExpiresAt" timestamp with time zone
);


ALTER TABLE public.users OWNER TO fusehealth_user;

--
-- TOC entry 5805 (class 0 OID 111282)
-- Dependencies: 238
-- Data for Name: BrandSubscription; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."BrandSubscription" (id, "deletedAt", "userId", "planType", status, "stripeSubscriptionId", "stripeCustomerId", "stripePriceId", "monthlyPrice", "currentPeriodStart", "currentPeriodEnd", "cancelledAt", "paymentDue", "trialStart", "trialEnd", features, "createdAt", "updatedAt") FROM stdin;
acec8ade-9e52-4bf6-ae89-c10a5cca1527	\N	1f8acc57-f137-4b51-ad44-cad317ba43cf	professional	active	sub_1SAkvvELzhgYQXTR69Kfwsu9	cus_T6y6ZYYVyxPhlE	price_1SAjVKELzhgYQXTRS0vQGJ1m	199.00	2025-09-24 05:08:06.161+00	2025-10-24 05:08:06.161+00	\N	\N	\N	\N	\N	2025-09-24 05:08:05.909+00	2025-09-24 05:08:06.162+00
e3cb155c-5124-435f-a664-5552df9d0167	\N	1f8acc57-f137-4b51-ad44-cad317ba43cf	professional	processing	sub_1SAkkOELzhgYQXTRsPPeNqDw	cus_T6y6ZYYVyxPhlE	price_1SAjVKELzhgYQXTRS0vQGJ1m	199.00	\N	\N	\N	\N	\N	\N	\N	2025-09-24 05:56:25.458+00	2025-09-24 05:56:25.458+00
\.


--
-- TOC entry 5806 (class 0 OID 111405)
-- Dependencies: 239
-- Data for Name: BrandSubscriptionPlans; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."BrandSubscriptionPlans" (id, "deletedAt", "planType", name, description, "monthlyPrice", "stripePriceId", "maxProducts", "maxCampaigns", "analyticsAccess", "customerSupport", "customBranding", "apiAccess", "whiteLabel", "customIntegrations", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
58c745ed-3e03-4893-a694-ce05069e4bed	\N	starter	Starter	Perfect for small brands getting started	99.00	price_1SAjV0ELzhgYQXTR6V1Dq6wB	50	5	t	email	f	f	f	f	t	1	2025-09-24 04:17:04.808575+00	2025-09-24 04:17:04.808575+00
9583b423-b875-4b13-9444-0118c15b5267	\N	professional	Professional	Ideal for growing brands with advanced needs	199.00	price_1SAjVKELzhgYQXTRS0vQGJ1m	200	20	t	priority	t	t	f	f	t	2	2025-09-24 04:17:04.808575+00	2025-09-24 04:17:04.808575+00
89d2f746-f978-4b3b-82bf-3ce4de816faf	\N	enterprise	Enterprise	Full-featured solution for large organizations	499.00	price_1SAjVSELzhgYQXTRCprM1gJc	-1	-1	t	dedicated	t	t	t	t	t	3	2025-09-24 04:17:04.808575+00	2025-09-24 04:17:04.808575+00
\.


--
-- TOC entry 5793 (class 0 OID 16862)
-- Dependencies: 226
-- Data for Name: Clinic; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Clinic" (id, "deletedAt", slug, logo, name, "createdAt", "updatedAt", active, status, website, address, city, state, "zipCode") FROM stdin;
0d0f12ea-fdc5-4227-a0b9-b3e5b24d0b48	\N	limit		Limit	2025-09-16 04:09:54.01+00	2025-09-16 04:09:54.01+00	f	pending	\N	\N	\N	\N	\N
29e3985c-20cd-45a8-adf7-d6f4cdd21a15	\N	limit-1		Limit	2025-09-16 04:11:02.255+00	2025-09-16 04:11:02.255+00	f	pending	\N	\N	\N	\N	\N
6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	limitless.health	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757646359188-tower.jpg	Limitless Health	2025-09-12 03:04:52.636+00	2025-09-12 03:05:59.261+00	f	pending	\N	\N	\N	\N	\N
6cef6794-7acb-4529-bb41-cef46849120b	\N	test-clinic-2		Test Clinic 2	2025-09-25 18:01:26.565+00	2025-09-25 18:01:26.565+00	f	pending					
c7d2c458-d3e4-41e1-b620-f05c338e7efc	\N	acme		Acme	2025-09-25 18:10:41.527+00	2025-09-25 18:10:41.527+00	f	pending		66 Hansen Way	Palo Alto	California	94304
\.


--
-- TOC entry 5787 (class 0 OID 16717)
-- Dependencies: 220
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Entity" (id, "deletedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5798 (class 0 OID 30727)
-- Dependencies: 231
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Order" (id, "deletedAt", "orderNumber", "userId", "treatmentId", "questionnaireId", status, "subtotalAmount", "discountAmount", "taxAmount", "shippingAmount", "totalAmount", notes, "questionnaireAnswers", "shippedAt", "deliveredAt", "createdAt", "updatedAt", "treatmentPlanId", "billingInterval", "paymentIntentId", "shippingAddressId", "physicianId") FROM stdin;
fb1ccfe5-657d-4320-912c-4076c4905a40	\N	ORD-1757996649126-GX9NIB	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	2000.00	0.00	0.00	0.00	2000.00	\N	{}	\N	\N	2025-09-16 04:24:09.128+00	2025-09-16 04:24:09.128+00	\N	\N	\N	\N	\N
ce858a6f-662b-43a5-abfb-81e2412cb372	\N	ORD-1757997157841-L6SH5U	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	1300.00	0.00	0.00	0.00	1300.00	\N	{}	\N	\N	2025-09-16 04:32:37.841+00	2025-09-16 04:32:37.841+00	\N	\N	\N	\N	\N
c451ffec-5618-47e8-a849-b5aee9def1db	\N	ORD-1757997545952-4VI19A	63ab9a4a-ddd0-492b-9912-c7a731df19f4	724eb0c4-54a3-447c-8814-de4c1060e77a	\N	pending	350.00	0.00	0.00	0.00	350.00	\N	{}	\N	\N	2025-09-16 04:39:05.952+00	2025-09-16 04:39:05.952+00	\N	\N	\N	\N	\N
605c2882-2432-4e31-9c19-2c09eded4ebe	\N	ORD-1757998375524-T02VIR	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	2100.00	0.00	0.00	0.00	2100.00	\N	{}	\N	\N	2025-09-16 04:52:55.524+00	2025-09-16 04:52:55.524+00	\N	\N	\N	\N	\N
67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	\N	ORD-1757999721881-11PO6N	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	900.00	0.00	0.00	0.00	900.00	\N	{}	\N	\N	2025-09-16 05:15:21.882+00	2025-09-16 05:15:21.882+00	\N	\N	\N	\N	\N
22659bdc-ce0d-4ee7-bf69-869fd119d0c2	\N	ORD-1758069422751-XN63AZ	63ab9a4a-ddd0-492b-9912-c7a731df19f4	724eb0c4-54a3-447c-8814-de4c1060e77a	\N	pending	79.00	0.00	0.00	0.00	79.00	\N	{}	\N	\N	2025-09-17 00:37:02.751+00	2025-09-17 00:37:02.751+00	\N	\N	\N	\N	\N
d1526926-5dd0-4cc4-87e1-d060a312dc3a	\N	ORD-1758260172037-LJON4P	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	299.00	0.00	0.00	0.00	299.00	\N	{}	\N	\N	2025-09-19 05:36:12.039+00	2025-09-19 05:36:12.039+00	\N	\N	\N	\N	\N
32f70bf9-e1a1-4258-945d-791d5b469c3e	\N	ORD-1758263238607-FLOPLM	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	698.00	0.00	0.00	0.00	698.00	\N	{}	\N	\N	2025-09-19 06:27:18.607+00	2025-09-19 06:27:18.607+00	\N	\N	\N	\N	\N
6c8a6827-cf48-4b7b-824d-4a90dd75661e	\N	ORD-1758313924593-YG4UWE	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 20:32:04.595+00	2025-09-19 20:32:04.595+00	\N	\N	\N	\N	\N
bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	\N	ORD-1758314273723-QS12OM	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 20:37:53.724+00	2025-09-19 20:37:53.724+00	\N	\N	\N	\N	\N
22b01915-6732-44f0-84ca-5c276ad102b5	\N	ORD-1758314710702-MLYAK6	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 20:45:10.703+00	2025-09-19 20:45:10.703+00	\N	\N	\N	\N	\N
4df9af65-b91d-46cc-b119-6d02b5b52126	\N	ORD-1758315049588-AGWKSR	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 20:50:49.588+00	2025-09-19 20:50:49.588+00	\N	\N	\N	\N	\N
bc2797de-d533-453b-ae07-1e2c5de49957	\N	ORD-1758315163075-FWCUCN	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 20:52:43.076+00	2025-09-19 20:52:43.076+00	\N	\N	\N	\N	\N
c19416b1-13c1-48f4-a6bd-2a0742c76e8d	\N	ORD-1758329145788-651LE2	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 00:45:45.788+00	2025-09-20 00:45:45.788+00	\N	\N	\N	\N	\N
03665e11-33aa-42f0-8371-12eed398603c	\N	ORD-1758329312385-J5F35O	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 00:48:32.386+00	2025-09-20 00:48:32.386+00	\N	\N	\N	\N	\N
20da32f3-5bd8-45e3-a637-c65054251d18	\N	ORD-1758329542373-KFX71F	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 00:52:22.374+00	2025-09-20 00:52:22.374+00	\N	\N	\N	\N	\N
f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	\N	ORD-1758330972014-ZD37XV	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:16:12.015+00	2025-09-20 01:16:12.015+00	\N	\N	\N	\N	\N
621e348f-d5ee-418d-947c-8e7e552059f2	\N	ORD-1758330982167-61IM3Z	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:16:22.168+00	2025-09-20 01:16:22.168+00	\N	\N	\N	\N	\N
4d8b5d5b-39a5-4f70-823b-064b08108388	\N	ORD-1758331564655-ZL5SWZ	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:26:04.656+00	2025-09-20 01:26:04.656+00	\N	\N	\N	\N	\N
ec39a570-883f-4ee4-a466-e62d696c7256	\N	ORD-1758331742160-4EYAAX	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:29:02.162+00	2025-09-20 01:29:02.162+00	\N	\N	\N	\N	\N
5ab11918-f299-45f9-8973-84ee7294cffb	\N	ORD-1758332094132-W93UJL	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:34:54.135+00	2025-09-20 01:34:54.135+00	\N	\N	\N	\N	\N
34dde290-1467-4d40-a293-75b17bf7fcda	\N	ORD-1758332559191-8FSGCG	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:42:39.193+00	2025-09-20 01:42:39.193+00	\N	\N	\N	\N	\N
e6a642c9-d543-407b-a74d-69b6f5e926f7	\N	ORD-1758340738411-P0X4W9	9bc80814-7c2d-4624-9000-72b38a03c6fd	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 03:58:58.411+00	2025-09-20 03:58:58.411+00	\N	\N	\N	\N	\N
4c40d1e6-c624-4fdd-864c-716c006618d6	\N	ORD-1758341434226-CQGXN0	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:10:34.229+00	2025-09-20 04:10:34.229+00	\N	\N	\N	\N	\N
d5632389-ae5f-4cb2-b02c-a52ed736033e	\N	ORD-1758341593568-RB541I	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:13:13.568+00	2025-09-20 04:13:13.568+00	\N	\N	\N	\N	\N
9fdba450-da30-4623-b444-d209dcac9287	\N	ORD-1758341603529-T0AKCA	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:13:23.53+00	2025-09-20 04:13:23.53+00	\N	\N	\N	\N	\N
a1719265-616b-4c45-96db-7cc251157458	\N	ORD-1758341634209-YCIONC	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:13:54.209+00	2025-09-20 04:13:54.209+00	\N	\N	\N	\N	\N
33111ce2-f5b2-4478-a4ef-de03ac8fbe32	\N	ORD-1758341653261-KRPJ5B	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:14:13.262+00	2025-09-20 04:14:13.262+00	\N	\N	\N	\N	\N
1ea76be3-2cf1-42cf-b483-f058d053b2c4	\N	ORD-1758341800805-7EWFOC	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:16:40.806+00	2025-09-20 04:16:40.806+00	\N	\N	\N	\N	\N
59ec0ef5-5817-4d10-83ce-9f1b230d2322	\N	ORD-1758341809993-TS221N	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:16:49.993+00	2025-09-20 04:16:49.993+00	\N	\N	\N	\N	\N
d2333798-adce-4b61-a3f8-ca47443a7560	\N	ORD-1758343678354-QZYNTB	2b6a9d71-a7be-4216-8d3e-c23aeb1ef9e4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:47:58.355+00	2025-09-20 04:47:58.355+00	\N	\N	\N	\N	\N
ee463fba-2ff1-41db-8d06-9216804ebe4d	\N	ORD-1758343994678-Z9UF7N	036a4efd-f65a-47f5-958e-04d3cdbee596	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:53:14.678+00	2025-09-20 04:53:14.678+00	\N	\N	\N	\N	\N
306613e2-8ca8-4270-a636-14ec5ff186bd	\N	ORD-1758344005887-IYVQNJ	036a4efd-f65a-47f5-958e-04d3cdbee596	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:53:25.887+00	2025-09-20 04:53:25.887+00	\N	\N	\N	\N	\N
0e0a1874-8c35-4561-a5a7-c7199da57a56	\N	ORD-1758344061260-DTMM7Y	036a4efd-f65a-47f5-958e-04d3cdbee596	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 04:54:21.261+00	2025-09-20 04:54:21.261+00	\N	\N	\N	\N	\N
0fcd8594-693c-431d-bfa2-a044619f7981	\N	ORD-1758344445957-4IPOE9	15d13138-9f32-4358-92d8-600d9c6fe558	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 05:00:45.957+00	2025-09-20 05:00:45.957+00	\N	\N	\N	\N	\N
625276f3-24e2-49d6-8a2a-5c35ef494128	\N	ORD-1758344655942-WDY1TO	df8f4c32-b6ba-4efd-af34-afcc6272a945	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 05:04:15.942+00	2025-09-20 05:04:15.942+00	\N	\N	\N	\N	\N
f6564040-0bba-41d2-be04-c38cc51dfc40	\N	ORD-1758346876556-7OKUFF	89b0ef70-7516-4fad-ac4a-37ac74815031	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	{"Last Name": "Cena8", "First Name": "John", "Email Address": "john.cena8@gmail.com", "Mobile Number": "314135135", "Goal Weight (pounds)": "111", "What dose were you on?": "1mg weekly", "What state do you live in?": "Alabama", "What's your date of birth?": "4111-04-01", "When did you last take it?": "2 months ago", "What's your gender at birth?": "Male", "Which medication WERE YOU LAST ON?": "Semaglutide (Ozempic, Wegovy)", "Did you experience any side effects?": "No", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "Yes, I take medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "Yes, I have taken weight loss medications before.", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "Gastroparesis (Paralysis of your intestines),None of the above", "Please list all medications, vitamins, and supplements": "med 1, med 2", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-20 05:41:16.557+00	2025-09-20 05:41:16.557+00	\N	\N	\N	\N	\N
e8656871-3d0c-4afd-9751-cfc12d7d0b33	\N	ORD-1758347274345-886QC3	2551f7cc-8c84-48da-bec3-fde2b39bc3cb	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	{"Last Name": "Cena9", "First Name": "John", "Email Address": "john.cena9@gmail.com", "Mobile Number": "2133134444", "Goal Weight (pounds)": "111", "What dose were you on?": "1mg weekly", "What state do you live in?": "Alabama", "What's your date of birth?": "1988-12-07", "When did you last take it?": "2 months", "What's your gender at birth?": "Male", "Which medication WERE YOU LAST ON?": "Liraglutide (Saxenda, Victoza)", "Did you experience any side effects?": "No", "Have you tried losing weight before?": "No, this is my first time actively trying to lose weight.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "Yes, I take medications", "Do you have any of these medical conditions?": "Hypertension,High cholesterol or triglycerides", "Have you taken weight loss medications before?": "Yes, I have taken weight loss medications before.", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "Gastroparesis (Paralysis of your intestines),Triglycerides over 600 at any point", "Please list all medications, vitamins, and supplements": "med1,med2", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-20 05:47:54.345+00	2025-09-20 05:47:54.345+00	\N	\N	\N	\N	\N
07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	\N	ORD-1758592039773-O5L8IN	0007334a-e487-43a7-971b-5c4c8d2950fa	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	{"Last Name": "Cena11", "First Name": "John", "Email Address": "john.cena11@gmail.com", "Mobile Number": "135135135", "Goal Weight (pounds)": "111", "What dose were you on?": "1mg weekly", "What state do you live in?": "Alabama", "What's your date of birth?": "1998-12-04", "When did you last take it?": "2 months ago", "What's your gender at birth?": "Male", "Which medication WERE YOU LAST ON?": "Semaglutide (Ozempic, Wegovy)", "Did you experience any side effects?": "No", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "Yes, I have taken weight loss medications before.", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-23 01:47:19.773+00	2025-09-23 01:47:19.773+00	00e000db-2f7b-405f-85a1-d72148dda001	biannual	\N	286c59e3-6e64-4acf-bdac-e71e045d54d5	\N
dbf880d4-b04f-4684-81a7-e461661d7599	\N	ORD-1758593129774-AQYBZT	8f59fb0a-ca8b-4e82-9104-eeea4e727f39	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	249.00	0.00	0.00	0.00	249.00	\N	{"Last Name": "Cena12", "First Name": "John", "Email Address": "john.cena12@gmail.com", "Mobile Number": "34135135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "9888-12-02", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-23 02:05:29.774+00	2025-09-23 02:05:30.988+00	00e000db-2f7b-405f-85a1-d72148dda001	biannual	pi_3SALbiELzhgYQXTR1kp2BWt3	7a859b38-9664-41b1-860e-fc34e49a87b2	\N
114c15ad-7dfa-49f9-8e88-381c46bf7f9b	\N	ORD-1758593455701-7H8GB6	b89d92d0-dc03-487b-a246-a341ec5d1f37	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	249.00	0.00	0.00	0.00	249.00	\N	{"Last Name": "Cena13", "First Name": "John", "Email Address": "john.cena13@gmail.com", "Mobile Number": "31413513513", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "2222-02-22", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "Insulin,None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-23 02:10:55.701+00	2025-09-23 02:10:56.943+00	00e000db-2f7b-405f-85a1-d72148dda001	biannual	pi_3SALgyELzhgYQXTR0h3sgTWd	e817cd77-9886-4247-9b61-5336c5f7ff3d	\N
8e64840e-be77-4470-8ba0-ea18fcbf0eaa	\N	ORD-1758593659918-RVOF1Y	b89d92d0-dc03-487b-a246-a341ec5d1f37	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	249.00	0.00	0.00	0.00	249.00	\N	{"Last Name": "Cena13", "First Name": "Joun", "Email Address": "john.cena13@gmail.com", "Mobile Number": "134135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "2222-02-02", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-23 02:14:19.919+00	2025-09-23 02:14:21.621+00	00e000db-2f7b-405f-85a1-d72148dda001	biannual	pi_3SALkHELzhgYQXTR1h17D9Ud	b34d7a27-b518-4bcc-930d-7a6ebfbfe089	\N
0e4001c7-4de0-47d9-a041-72d26a5f1c51	\N	ORD-1758594848325-YBW6G4	6b028641-7fb2-47bb-9fca-fedb3ea2ecd7	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "Cena14", "First Name": "John", "Email Address": "john.cena14@gmail.com", "Mobile Number": "135135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "1988-07-14", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-23 02:34:08.325+00	2025-09-23 02:34:08.612+00	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SAM3QELzhgYQXTR1i2I1BMw	e0805c5d-32e4-4f14-a635-918490036ead	\N
38264b46-354b-470f-adaa-a05336cc3637	\N	ORD-1758740070972-VVVW56	3b2cadbc-829e-4efd-b0f4-0a4e97c73ebb	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "Cena15", "First Name": "John", "Email Address": "john.cena15@gmail.com", "Mobile Number": "31135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "4111-04-03", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-24 18:54:30.972+00	2025-09-24 18:54:32.279+00	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SAxpkELzhgYQXTR1wKXRlCP	a2539844-289c-44bd-bf2a-76f8e42ce9e5	\N
5dec4e20-4cb0-40be-8977-c0e9adefa1d9	\N	ORD-1758746236515-P2THX9	95214474-1920-4524-a513-2325edeb73dc	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "Cena20", "First Name": "John", "Email Address": "john.cena20@gmail.com", "Mobile Number": "31413513", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "13413-04-13", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "Insulin", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-24 20:37:16.515+00	2025-09-24 20:37:17.686+00	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SAzRBELzhgYQXTR01so3lKu	30cbc304-7ce4-42b4-8f8b-286cf8cba3b4	\N
\.


--
-- TOC entry 5799 (class 0 OID 30755)
-- Dependencies: 232
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."OrderItem" (id, "deletedAt", "orderId", "productId", quantity, "unitPrice", "totalPrice", dosage, notes, "createdAt", "updatedAt", "pharmacyProductId") FROM stdin;
9b8e1c9e-a548-4bb6-8e29-085478440f61	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 04:24:09.33+00	2025-09-16 04:24:09.33+00	\N
6a7ada85-aaf6-4760-9239-6f62ff792114	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	550e8400-e29b-41d4-a716-446655440102	1	1100.00	1100.00	2.4 mg subcutaneous injection weekly	\N	2025-09-16 04:24:09.512+00	2025-09-16 04:24:09.512+00	\N
4452daf2-b63d-43f2-816b-1d58fb9b7e4a	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	550e8400-e29b-41d4-a716-446655440105	1	450.00	450.00	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	\N	2025-09-16 04:32:37.85+00	2025-09-16 04:32:37.85+00	\N
77f848a8-e0cc-4c33-8ba5-277aff24fd1f	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	550e8400-e29b-41d4-a716-446655440104	1	850.00	850.00	3 mg subcutaneous injection daily	\N	2025-09-16 04:32:37.853+00	2025-09-16 04:32:37.853+00	\N
0a12e6de-3940-4086-b835-c5aaffeabf1b	\N	c451ffec-5618-47e8-a849-b5aee9def1db	550e8400-e29b-41d4-a716-446655440001	1	350.00	350.00	500 mg per infusion	\N	2025-09-16 04:39:05.956+00	2025-09-16 04:39:05.956+00	\N
08e26fb7-2639-4f0f-907a-bf4195203796	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 04:52:55.532+00	2025-09-16 04:52:55.532+00	\N
50ca993b-3e34-431d-81d9-8a526e74c823	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	550e8400-e29b-41d4-a716-446655440103	1	1200.00	1200.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-16 04:52:55.536+00	2025-09-16 04:52:55.536+00	\N
9d40c33a-7b26-4411-8861-d34567d25253	\N	67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 05:15:22.072+00	2025-09-16 05:15:22.072+00	\N
c70d12e2-86e0-48b8-ae4e-0334b6a37351	\N	22659bdc-ce0d-4ee7-bf69-869fd119d0c2	550e8400-e29b-41d4-a716-446655440002	1	79.00	79.00	300 mg daily	\N	2025-09-17 00:37:02.759+00	2025-09-17 00:37:02.759+00	\N
d0ed16c1-eaed-425d-98aa-ad855e5301c7	\N	d1526926-5dd0-4cc4-87e1-d060a312dc3a	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 05:36:12.243+00	2025-09-19 05:36:12.243+00	\N
13097291-b4ee-4581-bed3-0f4c191badf2	\N	32f70bf9-e1a1-4258-945d-791d5b469c3e	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 06:27:18.62+00	2025-09-19 06:27:18.62+00	\N
699ff119-3f99-41b4-bab2-b1b32d463823	\N	32f70bf9-e1a1-4258-945d-791d5b469c3e	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 06:27:18.624+00	2025-09-19 06:27:18.624+00	\N
7a1e99e3-a843-49e3-965a-e624b7745db6	\N	6c8a6827-cf48-4b7b-824d-4a90dd75661e	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 20:32:04.818+00	2025-09-19 20:32:04.818+00	\N
8372bb43-10f8-4f39-9cb5-e478af475066	\N	6c8a6827-cf48-4b7b-824d-4a90dd75661e	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 20:32:05.007+00	2025-09-19 20:32:05.007+00	\N
5dce3cbf-82f1-4f05-853f-9be40da9d121	\N	6c8a6827-cf48-4b7b-824d-4a90dd75661e	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 20:32:05.199+00	2025-09-19 20:32:05.199+00	\N
e69e74dc-c437-4940-a951-dc12a4ed6ce4	\N	bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 20:37:53.915+00	2025-09-19 20:37:53.915+00	\N
053102f0-5724-4029-ada2-e96535dd8861	\N	bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 20:37:54.1+00	2025-09-19 20:37:54.1+00	\N
e802e838-28c9-4858-bc4d-d0ba7d9cf08c	\N	bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 20:37:54.298+00	2025-09-19 20:37:54.298+00	\N
2437f1c5-45b9-44eb-bca2-e26bdc9688ae	\N	22b01915-6732-44f0-84ca-5c276ad102b5	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 20:45:10.892+00	2025-09-19 20:45:10.892+00	\N
5177c56f-a18b-4a81-b1a6-054761e12f8b	\N	22b01915-6732-44f0-84ca-5c276ad102b5	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 20:45:11.079+00	2025-09-19 20:45:11.079+00	\N
389d7408-5996-4f66-8a77-3b7eedbc6430	\N	22b01915-6732-44f0-84ca-5c276ad102b5	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 20:45:11.27+00	2025-09-19 20:45:11.27+00	\N
5597a886-efdc-4266-8b96-aea867d3181f	\N	4df9af65-b91d-46cc-b119-6d02b5b52126	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 20:50:49.778+00	2025-09-19 20:50:49.778+00	\N
49d6e1a2-3f77-4086-922e-aee3ca327bd2	\N	4df9af65-b91d-46cc-b119-6d02b5b52126	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 20:50:49.965+00	2025-09-19 20:50:49.965+00	\N
8a257e31-c271-460e-9812-76787dd304a5	\N	4df9af65-b91d-46cc-b119-6d02b5b52126	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 20:50:50.146+00	2025-09-19 20:50:50.146+00	\N
ff943e2e-8e51-466f-84f4-a95149a6387e	\N	bc2797de-d533-453b-ae07-1e2c5de49957	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 20:52:43.268+00	2025-09-19 20:52:43.268+00	\N
5564fab9-6fce-45bd-831f-5786ab0492bb	\N	bc2797de-d533-453b-ae07-1e2c5de49957	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 20:52:43.456+00	2025-09-19 20:52:43.456+00	\N
4dd4c2d0-bff7-4bec-854e-e2a1d1ba9f0d	\N	bc2797de-d533-453b-ae07-1e2c5de49957	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 20:52:43.643+00	2025-09-19 20:52:43.643+00	\N
a53632a6-b1ec-4017-b752-242462a4bd6a	\N	c19416b1-13c1-48f4-a6bd-2a0742c76e8d	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 00:45:45.98+00	2025-09-20 00:45:45.98+00	\N
c30c4dcb-0544-46e3-8537-befec7eaa98b	\N	c19416b1-13c1-48f4-a6bd-2a0742c76e8d	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 00:45:46.212+00	2025-09-20 00:45:46.212+00	\N
11c51786-ed35-47d1-a0ba-25bc7e31c32a	\N	c19416b1-13c1-48f4-a6bd-2a0742c76e8d	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 00:45:46.403+00	2025-09-20 00:45:46.403+00	\N
91fbc500-ae08-4c05-835c-6d829793d9ba	\N	03665e11-33aa-42f0-8371-12eed398603c	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 00:48:32.587+00	2025-09-20 00:48:32.587+00	\N
38445701-168c-450c-b527-13c72b619604	\N	03665e11-33aa-42f0-8371-12eed398603c	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 00:48:32.776+00	2025-09-20 00:48:32.776+00	\N
d0729baa-06af-45ab-8a62-18ffe642145e	\N	03665e11-33aa-42f0-8371-12eed398603c	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 00:48:32.968+00	2025-09-20 00:48:32.968+00	\N
a4715ec2-4b8b-432a-900a-f4e5855b9303	\N	20da32f3-5bd8-45e3-a637-c65054251d18	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 00:52:22.577+00	2025-09-20 00:52:22.577+00	\N
53c286e1-53f9-419a-8303-f30af4dec105	\N	20da32f3-5bd8-45e3-a637-c65054251d18	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 00:52:22.762+00	2025-09-20 00:52:22.762+00	\N
e1edb3b5-91b6-4316-b94c-118ac90f7f81	\N	20da32f3-5bd8-45e3-a637-c65054251d18	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 00:52:22.947+00	2025-09-20 00:52:22.947+00	\N
a9b20adf-bead-4658-880b-059b2877b572	\N	f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:16:12.206+00	2025-09-20 01:16:12.206+00	\N
3e26cbfb-88ea-4dd4-8339-2556aad38f7b	\N	f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:16:12.394+00	2025-09-20 01:16:12.394+00	\N
74958a30-cd8b-469b-a847-45c56d1bafa2	\N	f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:16:12.594+00	2025-09-20 01:16:12.594+00	\N
b41d859a-b1ca-4560-9592-46eab0647f09	\N	621e348f-d5ee-418d-947c-8e7e552059f2	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:16:22.355+00	2025-09-20 01:16:22.355+00	\N
8e199697-9ca9-45fe-a193-8f5f1c0d9f40	\N	621e348f-d5ee-418d-947c-8e7e552059f2	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:16:22.539+00	2025-09-20 01:16:22.539+00	\N
fde4f8af-cbcb-48e4-86dc-c79bdc97bef5	\N	621e348f-d5ee-418d-947c-8e7e552059f2	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:16:22.725+00	2025-09-20 01:16:22.725+00	\N
0d9468d0-7063-4ce9-8036-1c138763e7a8	\N	4d8b5d5b-39a5-4f70-823b-064b08108388	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:26:04.856+00	2025-09-20 01:26:04.856+00	\N
7769dc39-234e-4b81-9f80-02b4e8677b48	\N	4d8b5d5b-39a5-4f70-823b-064b08108388	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:26:05.12+00	2025-09-20 01:26:05.12+00	\N
d2df4d94-9e51-4eff-bad4-5779641285a1	\N	4d8b5d5b-39a5-4f70-823b-064b08108388	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:26:05.31+00	2025-09-20 01:26:05.31+00	\N
fc98f7f2-986b-410a-a616-6b6c9e37c509	\N	ec39a570-883f-4ee4-a466-e62d696c7256	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:29:02.363+00	2025-09-20 01:29:02.363+00	\N
b6a33e22-def7-43fa-91bb-5fc6d0828534	\N	ec39a570-883f-4ee4-a466-e62d696c7256	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:29:02.555+00	2025-09-20 01:29:02.555+00	\N
e9119d17-8ada-4d9c-9013-ea26119bec91	\N	ec39a570-883f-4ee4-a466-e62d696c7256	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:29:02.741+00	2025-09-20 01:29:02.741+00	\N
5bc0af52-9e34-48eb-96f6-44ab6c6c1bbc	\N	5ab11918-f299-45f9-8973-84ee7294cffb	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:34:54.332+00	2025-09-20 01:34:54.332+00	\N
1e1c86cf-cb3f-4746-8e0d-0b613112e4eb	\N	5ab11918-f299-45f9-8973-84ee7294cffb	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:34:54.521+00	2025-09-20 01:34:54.521+00	\N
8efeb543-9b2a-400d-aa42-bc1dcc3f98e3	\N	5ab11918-f299-45f9-8973-84ee7294cffb	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:34:54.722+00	2025-09-20 01:34:54.722+00	\N
71722223-0ed5-4a7d-961c-979461abd139	\N	34dde290-1467-4d40-a293-75b17bf7fcda	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:42:39.393+00	2025-09-20 01:42:39.393+00	\N
20c65517-4b6d-44da-9a9b-33e654350e28	\N	34dde290-1467-4d40-a293-75b17bf7fcda	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:42:39.578+00	2025-09-20 01:42:39.578+00	\N
ae66d589-be70-4049-8d50-622907f7a7dc	\N	34dde290-1467-4d40-a293-75b17bf7fcda	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:42:39.768+00	2025-09-20 01:42:39.768+00	\N
2e8d3179-9fe5-426c-be8b-66e8d84f032a	\N	e6a642c9-d543-407b-a74d-69b6f5e926f7	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 03:58:58.61+00	2025-09-20 03:58:58.61+00	\N
ce72eefd-94af-42e9-bc90-b2486379cc1a	\N	e6a642c9-d543-407b-a74d-69b6f5e926f7	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 03:58:58.799+00	2025-09-20 03:58:58.799+00	\N
b8cac498-1af3-4969-be27-de0ce7c4a99d	\N	e6a642c9-d543-407b-a74d-69b6f5e926f7	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 03:58:58.988+00	2025-09-20 03:58:58.988+00	\N
45ec6c8e-5225-4cf0-81ea-7886ba1f5747	\N	4c40d1e6-c624-4fdd-864c-716c006618d6	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:10:34.413+00	2025-09-20 04:10:34.413+00	\N
c87e5621-0964-4255-995d-32769683e5bd	\N	4c40d1e6-c624-4fdd-864c-716c006618d6	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:10:34.592+00	2025-09-20 04:10:34.592+00	\N
f945e684-6535-4339-b9cb-f08b5329baae	\N	4c40d1e6-c624-4fdd-864c-716c006618d6	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:10:34.775+00	2025-09-20 04:10:34.775+00	\N
024a677d-8110-4fe3-b534-fd69a131df04	\N	d5632389-ae5f-4cb2-b02c-a52ed736033e	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:13:13.759+00	2025-09-20 04:13:13.759+00	\N
0137af52-0045-4542-90d7-052fb8852157	\N	d5632389-ae5f-4cb2-b02c-a52ed736033e	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:13:13.941+00	2025-09-20 04:13:13.941+00	\N
63f2ef32-b213-46a4-9f30-221207a24793	\N	d5632389-ae5f-4cb2-b02c-a52ed736033e	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:13:14.126+00	2025-09-20 04:13:14.126+00	\N
1fd3ff0d-be74-462e-9611-76bcd75c7f87	\N	9fdba450-da30-4623-b444-d209dcac9287	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:13:23.715+00	2025-09-20 04:13:23.715+00	\N
cb8580a4-724d-4db3-9cfb-daebf7e85392	\N	9fdba450-da30-4623-b444-d209dcac9287	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:13:23.896+00	2025-09-20 04:13:23.896+00	\N
11bf9ceb-fde4-411c-b3f3-61f66da7f00e	\N	9fdba450-da30-4623-b444-d209dcac9287	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:13:24.082+00	2025-09-20 04:13:24.082+00	\N
6c8732c3-252f-4947-97b2-46313db15c39	\N	a1719265-616b-4c45-96db-7cc251157458	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:13:54.396+00	2025-09-20 04:13:54.396+00	\N
aa3fd93a-e802-4bd9-a3ad-87a78477ad83	\N	a1719265-616b-4c45-96db-7cc251157458	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:13:54.581+00	2025-09-20 04:13:54.581+00	\N
52050b6d-2a27-4f1a-b0e3-0fcc1324a452	\N	a1719265-616b-4c45-96db-7cc251157458	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:13:54.767+00	2025-09-20 04:13:54.767+00	\N
e6257fbc-27c4-47e6-bca0-a1111284a0a7	\N	33111ce2-f5b2-4478-a4ef-de03ac8fbe32	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:14:13.446+00	2025-09-20 04:14:13.446+00	\N
c7cd675e-be9b-4660-b883-14f0e59c3a63	\N	33111ce2-f5b2-4478-a4ef-de03ac8fbe32	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:14:13.632+00	2025-09-20 04:14:13.632+00	\N
3e7e7b3c-a7db-41cb-a3da-e3e77acd6edf	\N	33111ce2-f5b2-4478-a4ef-de03ac8fbe32	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:14:13.815+00	2025-09-20 04:14:13.815+00	\N
06220820-8b25-4838-8a5e-34325a490b31	\N	1ea76be3-2cf1-42cf-b483-f058d053b2c4	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:16:40.999+00	2025-09-20 04:16:40.999+00	\N
b3fe9508-4d60-400a-af13-800837a00b32	\N	1ea76be3-2cf1-42cf-b483-f058d053b2c4	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:16:41.187+00	2025-09-20 04:16:41.187+00	\N
f7f97046-4bd8-45f5-a1f3-3d1696569fca	\N	1ea76be3-2cf1-42cf-b483-f058d053b2c4	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:16:41.367+00	2025-09-20 04:16:41.367+00	\N
b0c58df6-ef4e-40db-a543-97f74c154e9c	\N	59ec0ef5-5817-4d10-83ce-9f1b230d2322	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:16:50.179+00	2025-09-20 04:16:50.179+00	\N
5bad797c-c7d8-47fa-9fc1-2bf5245cb81c	\N	59ec0ef5-5817-4d10-83ce-9f1b230d2322	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:16:50.365+00	2025-09-20 04:16:50.365+00	\N
a0c9cb80-cfdd-4865-a1d3-1ea824cec74f	\N	59ec0ef5-5817-4d10-83ce-9f1b230d2322	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:16:50.548+00	2025-09-20 04:16:50.548+00	\N
34231228-ce70-4e16-8dfa-637d4d22a255	\N	d2333798-adce-4b61-a3f8-ca47443a7560	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:47:58.54+00	2025-09-20 04:47:58.54+00	\N
56369ec1-30e6-4df6-beb8-639af5819c12	\N	d2333798-adce-4b61-a3f8-ca47443a7560	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:47:58.725+00	2025-09-20 04:47:58.725+00	\N
a0d13eae-b0a9-4366-aa2e-ff9996895ebb	\N	d2333798-adce-4b61-a3f8-ca47443a7560	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:47:58.907+00	2025-09-20 04:47:58.907+00	\N
0f83577b-da13-4e0a-ad87-08155762ab23	\N	ee463fba-2ff1-41db-8d06-9216804ebe4d	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:53:14.866+00	2025-09-20 04:53:14.866+00	\N
18cce749-dd98-4bfc-834f-0891c32430f9	\N	ee463fba-2ff1-41db-8d06-9216804ebe4d	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:53:15.05+00	2025-09-20 04:53:15.05+00	\N
12b50350-eb10-41ff-84ac-382bd3e9e969	\N	ee463fba-2ff1-41db-8d06-9216804ebe4d	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:53:15.236+00	2025-09-20 04:53:15.236+00	\N
2213b499-6b18-43ab-a624-705be775c8a7	\N	306613e2-8ca8-4270-a636-14ec5ff186bd	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:53:26.069+00	2025-09-20 04:53:26.069+00	\N
ea60cb42-ae5e-4be8-bad1-ad7a2f9e5c65	\N	306613e2-8ca8-4270-a636-14ec5ff186bd	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:53:26.262+00	2025-09-20 04:53:26.262+00	\N
5cebe851-3f32-4846-b6a8-f137b4de8be3	\N	306613e2-8ca8-4270-a636-14ec5ff186bd	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:53:26.46+00	2025-09-20 04:53:26.46+00	\N
118ce0f5-4f6b-4594-afb9-5429f79edc04	\N	0e0a1874-8c35-4561-a5a7-c7199da57a56	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 04:54:21.444+00	2025-09-20 04:54:21.444+00	\N
eed5b518-39a1-4511-ac59-989604a9d0ac	\N	0e0a1874-8c35-4561-a5a7-c7199da57a56	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 04:54:21.633+00	2025-09-20 04:54:21.633+00	\N
53cbdb39-0969-4055-a8bc-f00e25d06c1b	\N	0e0a1874-8c35-4561-a5a7-c7199da57a56	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 04:54:21.816+00	2025-09-20 04:54:21.816+00	\N
2276ab3f-0949-4989-947d-fb51c4ce2e53	\N	0fcd8594-693c-431d-bfa2-a044619f7981	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 05:00:46.15+00	2025-09-20 05:00:46.15+00	\N
45d757fa-d555-4653-9469-d01fd28bc3ad	\N	0fcd8594-693c-431d-bfa2-a044619f7981	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 05:00:46.336+00	2025-09-20 05:00:46.336+00	\N
c7bd916d-acb4-4b0e-8d2f-a8cec4a5ee87	\N	0fcd8594-693c-431d-bfa2-a044619f7981	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 05:00:46.528+00	2025-09-20 05:00:46.528+00	\N
3b2b28e5-3f6d-42cf-99a7-70e2b80cb0f9	\N	625276f3-24e2-49d6-8a2a-5c35ef494128	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 05:04:16.131+00	2025-09-20 05:04:16.131+00	\N
3b853ef3-3551-4dc5-8599-c1d8cdfb0faf	\N	625276f3-24e2-49d6-8a2a-5c35ef494128	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 05:04:16.323+00	2025-09-20 05:04:16.323+00	\N
f5d08fbb-a605-45dd-b758-f67de7646c13	\N	625276f3-24e2-49d6-8a2a-5c35ef494128	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 05:04:16.507+00	2025-09-20 05:04:16.507+00	\N
a191fc39-3ffd-4fac-b1f0-950943e96765	\N	f6564040-0bba-41d2-be04-c38cc51dfc40	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 05:41:16.946+00	2025-09-20 05:41:16.946+00	\N
fdf0383a-237b-4c7a-800a-1da82d2e4882	\N	f6564040-0bba-41d2-be04-c38cc51dfc40	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 05:41:17.151+00	2025-09-20 05:41:17.151+00	\N
082ef799-68a0-4348-b781-2f73f42c3b00	\N	f6564040-0bba-41d2-be04-c38cc51dfc40	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 05:41:17.333+00	2025-09-20 05:41:17.333+00	\N
a9f707dc-6970-41d6-aed4-89ba36343b5a	\N	e8656871-3d0c-4afd-9751-cfc12d7d0b33	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 05:47:54.357+00	2025-09-20 05:47:54.357+00	\N
d6301f31-da3b-4c64-b893-109215df508d	\N	e8656871-3d0c-4afd-9751-cfc12d7d0b33	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 05:47:54.361+00	2025-09-20 05:47:54.361+00	\N
b0e4417d-ff09-4016-9f1a-81edf058ecc5	\N	e8656871-3d0c-4afd-9751-cfc12d7d0b33	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 05:47:54.364+00	2025-09-20 05:47:54.364+00	\N
45951402-f089-4eef-a871-994de52f73e7	\N	07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-23 01:47:19.973+00	2025-09-23 01:47:19.973+00	\N
4cb75a47-2a9d-4c2f-b3bc-ff5640ad2985	\N	07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-23 01:47:20.156+00	2025-09-23 01:47:20.156+00	\N
4869cc4a-e0fd-459b-80c5-0b22d0188d01	\N	07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-23 01:47:20.34+00	2025-09-23 01:47:20.34+00	\N
c3e9218f-8017-47cb-9ef7-a63e5221250d	\N	dbf880d4-b04f-4684-81a7-e461661d7599	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-23 02:05:29.987+00	2025-09-23 02:05:29.987+00	\N
7a22b142-bd8c-44b0-8fec-ada98e56e425	\N	dbf880d4-b04f-4684-81a7-e461661d7599	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-23 02:05:30.177+00	2025-09-23 02:05:30.177+00	\N
92312fe7-b937-4cb8-9ecf-3353b067da24	\N	dbf880d4-b04f-4684-81a7-e461661d7599	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-23 02:05:30.386+00	2025-09-23 02:05:30.386+00	\N
f8d49d40-e8c8-46b9-a7d4-de467add1bfb	\N	114c15ad-7dfa-49f9-8e88-381c46bf7f9b	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-23 02:10:55.895+00	2025-09-23 02:10:55.895+00	\N
f06da820-2d60-4091-a41d-6b74dc2c4c88	\N	114c15ad-7dfa-49f9-8e88-381c46bf7f9b	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-23 02:10:56.077+00	2025-09-23 02:10:56.077+00	\N
e7c2f661-c382-4b83-8662-ad7692d6b22e	\N	114c15ad-7dfa-49f9-8e88-381c46bf7f9b	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-23 02:10:56.263+00	2025-09-23 02:10:56.263+00	\N
885f588a-4f8f-41c6-bc2e-ca305a1b08b3	\N	8e64840e-be77-4470-8ba0-ea18fcbf0eaa	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-23 02:14:20.12+00	2025-09-23 02:14:20.12+00	\N
8630a553-93f4-4e9a-9e71-001c1480ecb7	\N	8e64840e-be77-4470-8ba0-ea18fcbf0eaa	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-23 02:14:20.31+00	2025-09-23 02:14:20.31+00	\N
4e1f2a13-57f5-434c-9177-4a25087aa42f	\N	8e64840e-be77-4470-8ba0-ea18fcbf0eaa	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-23 02:14:20.495+00	2025-09-23 02:14:20.495+00	\N
d3a1a02c-9139-4faa-946c-1c218d4efa8f	\N	0e4001c7-4de0-47d9-a041-72d26a5f1c51	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-23 02:34:08.334+00	2025-09-23 02:34:08.334+00	\N
81ba29c0-1560-4f37-bc93-1b2c0b2ff3be	\N	0e4001c7-4de0-47d9-a041-72d26a5f1c51	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-23 02:34:08.339+00	2025-09-23 02:34:08.339+00	\N
5af25f4f-6afc-4d3d-8ba9-75e6a662edc1	\N	0e4001c7-4de0-47d9-a041-72d26a5f1c51	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-23 02:34:08.342+00	2025-09-23 02:34:08.342+00	\N
7d27b16e-272c-470c-9d38-c346e4572b9c	\N	38264b46-354b-470f-adaa-a05336cc3637	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-24 18:54:31.253+00	2025-09-24 18:54:31.253+00	\N
435e169c-fd70-478b-8f69-829378dc302d	\N	38264b46-354b-470f-adaa-a05336cc3637	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-24 18:54:31.442+00	2025-09-24 18:54:31.442+00	\N
fadbec33-642e-4721-9e14-eed89bfefcc7	\N	38264b46-354b-470f-adaa-a05336cc3637	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-24 18:54:31.636+00	2025-09-24 18:54:31.636+00	\N
90a749c7-a32a-4733-977e-3aa8eb7bdd4b	\N	5dec4e20-4cb0-40be-8977-c0e9adefa1d9	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-24 20:37:16.706+00	2025-09-24 20:37:16.706+00	\N
d2d67a2f-c094-43f7-942a-162697aab36f	\N	5dec4e20-4cb0-40be-8977-c0e9adefa1d9	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-24 20:37:16.892+00	2025-09-24 20:37:16.892+00	\N
2f2eb3e2-c35d-4db0-a7c2-d3f0ae050b71	\N	5dec4e20-4cb0-40be-8977-c0e9adefa1d9	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-24 20:37:17.081+00	2025-09-24 20:37:17.081+00	\N
\.


--
-- TOC entry 5800 (class 0 OID 30795)
-- Dependencies: 233
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Payment" (id, "deletedAt", "orderId", "stripePaymentIntentId", status, "paymentMethod", amount, currency, "refundedAmount", "stripeChargeId", "stripeCustomerId", "lastFourDigits", "cardBrand", "cardCountry", "stripeMetadata", "failureReason", "paidAt", "refundedAt", "createdAt", "updatedAt") FROM stdin;
8fb95243-961a-438c-b33d-9ef508ec06c0	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	pi_3S7qR4GWJaDesMl93GrqozS5	pending	card	2000.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:24:10.695+00	2025-09-16 04:24:10.695+00
108d84d4-1790-40fa-91a0-aabe43c42d8e	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	pi_3S7qZGGWJaDesMl93ZLUL2o1	pending	card	1300.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:32:38.118+00	2025-09-16 04:32:38.118+00
d6851026-619e-4d14-967d-31f443d1e6dd	\N	c451ffec-5618-47e8-a849-b5aee9def1db	pi_3S7qfWGWJaDesMl90Fs9XXav	pending	card	350.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:39:06.213+00	2025-09-16 04:39:06.213+00
992f678c-98c8-4ff4-95db-a8960c7015d7	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	pi_3S7qstGWJaDesMl918PqxFGD	pending	card	2100.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:52:55.799+00	2025-09-16 04:52:55.799+00
977b03a3-4f69-4c23-9f2b-b1e751624066	\N	67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	pi_3S7rEdGWJaDesMl93OLi9K0S	pending	card	900.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 05:15:23.099+00	2025-09-16 05:15:23.099+00
c6fbcea2-d847-4130-8bb6-9f93a2a937b6	\N	22659bdc-ce0d-4ee7-bf69-869fd119d0c2	pi_3S89MoGWJaDesMl93aI3CHTt	pending	card	79.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-17 00:37:03.078+00	2025-09-17 00:37:03.078+00
129b2f91-3f0e-4ba7-8293-3237fc2ae603	\N	d1526926-5dd0-4cc4-87e1-d060a312dc3a	pi_3S8wzRGWJaDesMl92URWNwNM	pending	card	299.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-19 05:36:13.284+00	2025-09-19 05:36:13.284+00
05e0c5a3-75c9-49b5-96e4-5fcfde61dd27	\N	32f70bf9-e1a1-4258-945d-791d5b469c3e	pi_3S8xmsGWJaDesMl91F4TxPa4	pending	card	698.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-19 06:27:18.897+00	2025-09-19 06:27:18.897+00
\.


--
-- TOC entry 5807 (class 0 OID 128583)
-- Dependencies: 240
-- Data for Name: Physician; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Physician" (id, "deletedAt", "firstName", "middleName", "lastName", "phoneNumber", email, street, street2, city, state, zip, licenses, "pharmacyPhysicianId", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5789 (class 0 OID 16729)
-- Dependencies: 222
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Prescription" (id, "deletedAt", name, "expiresAt", "writtenAt", "patientId", "doctorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5791 (class 0 OID 16749)
-- Dependencies: 224
-- Data for Name: PrescriptionProducts; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."PrescriptionProducts" (id, "deletedAt", "prescriptionId", quantity, "productId", "createdAt", "updatedAt", "pharmacyProductId") FROM stdin;
\.


--
-- TOC entry 5788 (class 0 OID 16722)
-- Dependencies: 221
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Product" (id, "deletedAt", name, description, price, "activeIngredients", dosage, "imageUrl", "createdAt", "updatedAt", "pharmacyProductId", "clinicId") FROM stdin;
550e8400-e29b-41d4-a716-446655440001	\N	NAD+ IV Infusion	High-dose NAD+ delivered intravenously to replenish cellular energy, support DNA repair, and promote anti-aging benefits.	350	{NAD+}	500 mg per infusion	https://example.com/images/nad-iv.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440002	\N	NAD+ Capsules	Daily supplement containing bioavailable NAD+ precursors to maintain energy and support healthy aging.	79	{NAD+,Niacinamide}	300 mg daily	https://example.com/images/nad-capsules.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440003	\N	NAD+ Longevity Drip	Combination of NAD+ with B vitamins to enhance metabolism, reduce fatigue, and support nervous system health.	400	{NAD+,"Vitamin B12","Vitamin B6"}	750 mg NAD+ + B-complex per infusion	https://example.com/images/nad-b-complex.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440004	\N	NAD+ Detox Booster	Powerful anti-aging and detox combination with NAD+ and glutathione to fight oxidative stress and restore cellular health.	450	{NAD+,Glutathione}	500 mg NAD+ + 2000 mg Glutathione per infusion	https://example.com/images/nad-glutathione.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440005	\N	NAD+ Sublingual Spray	Fast-absorbing sublingual NAD+ spray to support daily energy, mood, and anti-aging.	65	{NAD+}	50 mg per spray, 2 sprays daily	https://example.com/images/nad-spray.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440101	\N	Ozempic (Semaglutide Injection)	A GLP-1 receptor agonist that helps regulate appetite and blood sugar, promoting weight loss and improving metabolic health.	900	{Semaglutide}	0.25–2 mg subcutaneous injection weekly	https://example.com/images/ozempic.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440102	\N	Wegovy (Semaglutide Injection)	An FDA-approved higher-dose version of semaglutide designed specifically for chronic weight management.	1100	{Semaglutide}	2.4 mg subcutaneous injection weekly	https://example.com/images/wegovy.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440103	\N	Mounjaro (Tirzepatide Injection)	A dual GIP and GLP-1 receptor agonist that enhances weight loss and improves insulin sensitivity for type 2 diabetes and obesity.	1200	{Tirzepatide}	2.5–15 mg subcutaneous injection weekly	https://example.com/images/mounjaro.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440104	\N	Saxenda (Liraglutide Injection)	A daily GLP-1 receptor agonist injection that reduces appetite and helps with sustained weight loss.	850	{Liraglutide}	3 mg subcutaneous injection daily	https://example.com/images/saxenda.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440105	\N	Contrave (Naltrexone/Bupropion Tablets)	An oral medication combining an opioid antagonist and an antidepressant to reduce food cravings and regulate appetite.	450	{Naltrexone,Bupropion}	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	https://example.com/images/contrave.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440202	\N	Compounded Tirzepatide	Dual GIP and GLP-1 receptor agonist for enhanced weight loss results.	399	{Tirzepatide}	2.5–15 mg subcutaneous injection weekly	https://example.com/images/compounded-tirzepatide.jpg	2025-09-18 01:57:34.854+00	2025-09-18 01:57:34.854+00	\N	\N
550e8400-e29b-41d4-a716-446655440203	\N	Compounded Liraglutide	Daily GLP-1 receptor agonist for appetite control and sustained weight loss.	250	{Liraglutide}	3 mg subcutaneous injection daily	https://example.com/images/compounded-liraglutide.jpg	2025-09-18 01:57:34.854+00	2025-09-18 01:57:34.854+00	\N	\N
0251349a-11b9-462d-a7a9-dd185773c586	\N	Tamoxifen	HORMONE THERAPY - Tablet - Manufactured	1	{Tamoxifen}	20mg	/images/default-product.png	2025-09-18 22:33:12.666+00	2025-09-18 22:33:12.666+00	14324	\N
03ef8ea1-464a-40ef-8e65-345648518f8e	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	10mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.582+00	2025-09-18 22:33:12.582+00	14353	\N
05b2ab08-58f1-4136-91c4-6f9826dfbfb7	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	15mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.59+00	2025-09-18 22:33:12.59+00	14356	\N
0810111e-cde5-4ba5-8787-56eb5e6ff71d	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	2	{Armour}	3 grain 180mg	/images/default-product.png	2025-09-18 22:33:12.641+00	2025-09-18 22:33:12.641+00	615	\N
0aa81fa8-7a91-42bc-82ad-4e5212fd0156	\N	Semaglutide/Methylcobalamin Injection (2.5mg/2mg -3mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	145	{Semaglutide,Methylcobalamin}	7.5mg / 6mg	/images/default-product.png	2025-09-18 22:33:12.458+00	2025-09-18 22:33:12.458+00	14617	\N
0b001ab1-0a1e-462a-8154-a276016c2a68	\N	Semaglutide Injection (2.5mg/mL - 1mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	85	{Semaglutide}	2.5mg	/images/default-product.png	2025-09-18 22:33:12.406+00	2025-09-18 22:33:12.406+00	14389	\N
0bd9d470-e508-48c3-b711-c210bd19551d	\N	KYZATREX - Testosterone Undecanoate 200mg Oral	TESTOSTERONE THERAPY - CAPSULE - Manufactured	1.25	{Testosterone}	200mg	/images/default-product.png	2025-09-18 22:33:12.622+00	2025-09-18 22:33:12.622+00	14208	\N
550e8400-e29b-41d4-a716-446655440201	\N	Compounded Semaglutide	Most commonly prescribed for consistent weight management. Same active ingredient as Ozempic®.	299	{Semaglutide}	0.25–2 mg subcutaneous injection weekly	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758772025528-window.jpg	2025-09-18 01:57:34.854+00	2025-09-25 03:47:07.106+00	\N	\N
0d3f26a4-6b1c-40d6-8ffd-c97689bb33dd	\N	Screamer Gel MAX (Sildenafil Citrate/Theophylline Anhydrous/Phentolamine Mesylate/Pentoxifylline/L-Arginine)	FEMALE LIBIDO AND ORGASM DISFUNCTION - 15g Gel - COMPOUNDED	50	{Sildenafil}	2% / 3%/0.01%/2%/6%	/images/default-product.png	2025-09-18 22:33:12.688+00	2025-09-18 22:33:12.688+00	1163	\N
0d7da3b1-2b2f-45ac-b144-5145254ad05a	\N	Syringe - Insulin	SYRINGES / MISC. - 1mL - Manufactured	0.25	{Syringe}	27G x 1 / 2 x 1ML	/images/default-product.png	2025-09-18 22:33:12.728+00	2025-09-18 22:33:12.728+00	14300	\N
10604afa-0cba-4e0a-8312-ef163b4483b4	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	1mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.564+00	2025-09-18 22:33:12.564+00	14197	\N
10b4d6c7-3789-4131-a7d8-6e6c43561ae3	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	7.25	{Semaglutide}	4mg	/images/default-product.png	2025-09-18 22:33:12.44+00	2025-09-18 22:33:12.44+00	14624	\N
117761cc-40cb-4c47-b042-6d47f52110a8	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	12.5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.577+00	2025-09-18 22:33:12.577+00	14352	\N
16082240-23a3-4ff7-9d0c-054083e8f4bd	\N	NAD+ INJECTION (200mg/ml -2.5mL)	WEIGHT LOSS - Injection - Manufactured	150	{NAD+}	500mg	/images/default-product.png	2025-09-18 22:33:12.505+00	2025-09-18 22:33:12.505+00	14388	\N
16291a80-a01d-466a-857d-feed8c8e55d6	\N	Metformin HCl	WEIGHT LOSS - Tablet - Manufactured	1	{Metformin}	500mg	/images/default-product.png	2025-09-18 22:33:12.486+00	2025-09-18 22:33:12.486+00	14320	\N
18cfd8a4-4e3d-45c4-96b4-ca58069b845d	\N	Finasteride	HAIR LOSS - TABLET - Manufactured	0.9	{Finasteride}	1mg	/images/default-product.png	2025-09-18 22:33:12.69+00	2025-09-18 22:33:12.69+00	14369	\N
194bcdd3-69f3-4103-b7dc-7e2eacf54f97	\N	DHEA	HORMONE THERAPY - CAPSULE - Manufactured	1	{DHEA}	25mg	/images/default-product.png	2025-09-18 22:33:12.646+00	2025-09-18 22:33:12.646+00	14201	\N
1d2c6a8a-2ac7-4820-bf10-34e75d13cd63	\N	Glutathione	VITAMINS/SUPPLEMENTS - Injection - Manufactured	65	{Glutathione}	100 mg / mL (30 mL)	/images/default-product.png	2025-09-18 22:33:12.706+00	2025-09-18 22:33:12.706+00	14382	\N
1d583605-ae55-49ce-a030-147d649ee842	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.587+00	2025-09-18 22:33:12.587+00	14355	\N
1d58b5df-abc2-4e23-a5ad-09245d626c38	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 3mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	280	{Tirzepatide,Methylcobalamin}	51mg / 6mg	/images/default-product.png	2025-09-18 22:33:12.47+00	2025-09-18 22:33:12.47+00	14402	\N
1e789bd9-7b2d-4024-91fc-a159461766bb	\N	NAD+ sublingual tablet	WEIGHT LOSS - Tablet - COMPOUNDED	7	{NAD+}	50mg	/images/default-product.png	2025-09-18 22:33:12.509+00	2025-09-18 22:33:12.509+00	14347	\N
1f6502f1-1556-4c33-88e0-6bd1634c8af0	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	2	{Armour}	15mg	/images/default-product.png	2025-09-18 22:33:12.637+00	2025-09-18 22:33:12.637+00	14191	\N
1f985e46-1a67-46cb-a3d0-9869151cab6b	\N	Tretinoin 0.05% cream (45g)	SKIN/DERMATOLOGY -  - Manufactured	75	{Tretinoin}	0.05%	/images/default-product.png	2025-09-18 22:33:12.606+00	2025-09-18 22:33:12.606+00	14311	\N
21462a9d-0466-4062-b981-6785e385a850	\N	Oxandrolone 50	HORMONE THERAPY - Capsule - COMPOUNDED	5	{Oxandrolone}	50mg	/images/default-product.png	2025-09-18 22:33:12.661+00	2025-09-18 22:33:12.661+00	399	\N
2165afa1-54a6-483a-b3c2-96a6016eae47	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	8.5	{Semaglutide}	6mg	/images/default-product.png	2025-09-18 22:33:12.449+00	2025-09-18 22:33:12.449+00	14363	\N
21688833-81b0-4f5f-aa62-8d21466cf4d3	\N	Progesterone	HORMONE THERAPY - Capsule - Manufactured	1	{Progesterone}	100mg	/images/default-product.png	2025-09-18 22:33:12.663+00	2025-09-18 22:33:12.663+00	14200	\N
21a299a0-0fde-49f1-8121-5785e6bc60a3	\N	Tadalafil / Oxytocin / PT-141 (Bremelanotide Acetate) SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	4	{Tadalafil}	5mg / 100iu/1,000mcg	/images/default-product.png	2025-09-18 22:33:12.679+00	2025-09-18 22:33:12.679+00	14159	\N
227bbe36-e5be-40e6-b605-c2a9db33f835	\N	Mounjaro	WEIGHT LOSS - Pen-Injector - Manufactured	1223	{Mounjaro}	5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.5+00	2025-09-18 22:33:12.5+00	14206	\N
2647310d-5b2c-40d8-b859-35ad8a2009af	\N	SYRINGE -LUERLOCK	SYRINGES / MISC. - 3ML - Manufactured	0.25	{SYRINGE}	25G X 1 X 3ML	/images/default-product.png	2025-09-18 22:33:12.73+00	2025-09-18 22:33:12.73+00	14118	\N
2b40f8d0-a2df-4569-b617-fd1a694595cd	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	23G x 1"	/images/default-product.png	2025-09-18 22:33:12.722+00	2025-09-18 22:33:12.722+00	427	\N
2c55ce42-acde-4a8b-85aa-aaa68a5db276	\N	Modafinil	WEIGHT LOSS - Tablet - Manufactured	1	{Modafinil}	200mg	/images/default-product.png	2025-09-18 22:33:12.492+00	2025-09-18 22:33:12.492+00	14309	\N
2edbcead-4c91-401d-bdb6-ed8039646446	\N	Semaglutide Injection (2.5mg/mL - 3mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	145	{Semaglutide}	7.5mg	/images/default-product.png	2025-09-18 22:33:12.43+00	2025-09-18 22:33:12.43+00	14391	\N
3020bf00-7286-4dd9-81fb-5c93e2aaccd1	\N	Phentermine Lollipop	WEIGHT LOSS - Lollipop - COMPOUNDED	2	{Phentermine}	30mg	/images/default-product.png	2025-09-18 22:33:12.527+00	2025-09-18 22:33:12.527+00	14203	\N
32a08f29-887b-47b1-a56e-dee2def30c8a	\N	Acne Gel (Tretinoin/Clindamyacin/Metronidazole/Azelaic Acid)	SKIN/DERMATOLOGY - 10g Gel - COMPOUNDED	35	{Tretinoin}	0.1% / 2%/0.75%/20%	/images/default-product.png	2025-09-18 22:33:12.598+00	2025-09-18 22:33:12.598+00	14268	\N
34b2e7e3-b779-4e46-86fd-766bf8b280ee	\N	Syringe - Insulin	SYRINGES / MISC. - 1ML - Manufactured	0.1	{Syringe}	30G x 5 / 16 x 1ML	/images/default-product.png	2025-09-18 22:33:12.726+00	2025-09-18 22:33:12.726+00	14298	\N
37bbf978-8d51-4f1e-bb3f-6763eebbe2fc	\N	Container (Sharps)	SYRINGES / MISC. - Each - Manufactured	7.5	{Container}	——	/images/default-product.png	2025-09-18 22:33:12.712+00	2025-09-18 22:33:12.712+00	359	\N
38b98af1-663a-4aa0-80d4-8cb666c3fb1b	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	27G x 1 / 2“	/images/default-product.png	2025-09-18 22:33:12.72+00	2025-09-18 22:33:12.72+00	1013	\N
38f9391c-b9fb-4250-8a0d-2055903d653b	\N	Zinc Sulfate Heptahydrate	VITAMINS/SUPPLEMENTS - Injection - Manufactured	85	{Zinc}	10mg / mL 30mL	/images/default-product.png	2025-09-18 22:33:12.707+00	2025-09-18 22:33:12.707+00	14586	\N
3916eead-5627-4b88-907d-5c75e0fb0cb8	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 1mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	200	{Tirzepatide,Methylcobalamin}	17mg / 2mg	/images/default-product.png	2025-09-18 22:33:12.466+00	2025-09-18 22:33:12.466+00	14400	\N
399c50fa-0f44-415e-bcc7-c358a57fed37	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	1.7mg / 0.75mL	/images/default-product.png	2025-09-18 22:33:12.571+00	2025-09-18 22:33:12.571+00	14243	\N
3a7c2a88-6efd-4e76-841c-8b2f0289aea9	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	3.5	{Armour}	2 grain (120mg)	/images/default-product.png	2025-09-18 22:33:12.643+00	2025-09-18 22:33:12.643+00	169	\N
3c05d2d5-5638-4238-b404-02c165737e39	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	3.7	{Semaglutide}	2mg	/images/default-product.png	2025-09-18 22:33:12.447+00	2025-09-18 22:33:12.447+00	14296	\N
3ec356ba-2fb5-46d4-858b-96ca9ca36814	\N	Testosterone Gel 20% (30g)	TESTOSTERONE THERAPY - Gel - COMPOUNDED	45	{Testosterone}	20% (200mg / gm)	/images/default-product.png	2025-09-18 22:33:12.631+00	2025-09-18 22:33:12.631+00	1182	\N
40d72721-e47f-4517-afb5-426385014be3	\N	Methionine/ Inositol/ Cyanocobalamin/ L-Carnitine	WEIGHT LOSS - TABLET - COMPOUNDED	1.25	{Cyanocobalamin}	25 / 25/1/100mg	/images/default-product.png	2025-09-18 22:33:12.489+00	2025-09-18 22:33:12.489+00	14181	\N
4111d6f3-bec8-41ba-b65b-026af5e4d3c4	\N	NAD+ INJECTION (200mg/ml -2.5mL)	NAD+ INJECTION (200mg/ml -2.5mL)\n	150	{test}	Injection	https://www.empowerpharmacy.com/wp-content/webpc-passthru.php?src=https://www.empowerpharmacy.com/wp-content/uploads/2025/07/2025-empower-pharmacy-nad-injection-1000mg-294x490-1.jpg	2025-09-17 17:00:57.627771+00	2025-09-17 17:00:57.627771+00	14209	\N
4347e0b1-59d8-4c4b-9312-95478cca3c6c	\N	Tirzepatide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	13.82	{Tirzepatide}	5mg	/images/default-product.png	2025-09-18 22:33:12.464+00	2025-09-18 22:33:12.464+00	14331	\N
45e257fa-f165-4ee6-813b-8207639c533f	\N	Minoxidil / Panthenol / Tretinoin	HAIR LOSS - SERUM - COMPOUNDED	45	{Minoxidil,Tretinoin}	5% / 5% / 0.025%	/images/default-product.png	2025-09-18 22:33:12.696+00	2025-09-18 22:33:12.696+00	14371	\N
479282c3-134a-4061-986d-d9645d0e4198	\N	Anastrozole	HORMONE THERAPY - Tablet - Manufactured	1	{Anastrozole}	1mg	/images/default-product.png	2025-09-18 22:33:12.635+00	2025-09-18 22:33:12.635+00	14168	\N
48ac0e38-ebc2-476e-a1b8-8e42dc52f51d	\N	Ozempic (with Needle Tips)	WEIGHT LOSS - Pen-Injector - Manufactured	1339	{Ozempic}	4mg / 3mL	/images/default-product.png	2025-09-18 22:33:12.521+00	2025-09-18 22:33:12.521+00	2181	\N
48c6644b-6935-48fb-85ab-fc48fcb3fb1b	\N	Naltrexone	WEIGHT LOSS - Tablet - COMPOUNDED	1	{Naltrexone}	10mg	/images/default-product.png	2025-09-18 22:33:12.511+00	2025-09-18 22:33:12.511+00	1188	\N
50848ed7-4587-432b-b21d-f08ab62da2b0	\N	Phentermine HCl	WEIGHT LOSS - Tablet - Manufactured	1	{Phentermine}	37.5mg	/images/default-product.png	2025-09-18 22:33:12.523+00	2025-09-18 22:33:12.523+00	14253	\N
52a192f8-810a-46cc-9dd3-7d023dd6f3f2	\N	Enclomiphene Citrate SL Tablet	HORMONE THERAPY - Sublingual - COMPOUNDED	2	{Enclomiphene}	25mg	/images/default-product.png	2025-09-18 22:33:12.651+00	2025-09-18 22:33:12.651+00	14177	\N
543cf219-8222-40bc-abb6-5b4df6f56025	\N	Testosterone Cypionate - Cotton Seed Oil (10mL)	TESTOSTERONE THERAPY - Injectable - Manufactured	76	{Testosterone}	200mg / mL	/images/default-product.png	2025-09-18 22:33:12.624+00	2025-09-18 22:33:12.624+00	14255	\N
547d7e55-179d-4ab3-bb62-3c094fb4ce47	\N	Mounjaro	WEIGHT LOSS - Pen-Injector - Manufactured	1223	{Mounjaro}	15mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.494+00	2025-09-18 22:33:12.494+00	14204	\N
557e15bb-8dc7-4888-810c-e83532908d0b	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	3	{Armour}	1.5 grain (90mg)	/images/default-product.png	2025-09-18 22:33:12.64+00	2025-09-18 22:33:12.64+00	646	\N
577da129-bc77-4c11-b336-536640474b8a	\N	Benzocaine / Lidocaine / Tetracaine	SKIN/DERMATOLOGY - 50 grams - COMPOUNDED	45	{Benzocaine}	24% / 12% / 5%	/images/default-product.png	2025-09-18 22:33:12.6+00	2025-09-18 22:33:12.6+00	14372	\N
5800dc14-aba1-4079-bfb9-b22323cbe442	\N	Ozempic (with Needle Tips)	WEIGHT LOSS - Pen-Injector - Manufactured	1339	{Ozempic}	2mg / 3mL	/images/default-product.png	2025-09-18 22:33:12.518+00	2025-09-18 22:33:12.518+00	2180	\N
585466f4-a770-4f8b-8c6c-5a6a5f1e6c94	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	25G x 1"	/images/default-product.png	2025-09-18 22:33:12.718+00	2025-09-18 22:33:12.718+00	587	\N
5a5bcf82-380f-4cd3-822d-22f8b37ec5f8	\N	HCG (Pregnyl) 10,000 IU	FERTILITY / PREGNANCY - Vial - Manufactured	245	{HCG}	10,000 IU	/images/default-product.png	2025-09-18 22:33:12.702+00	2025-09-18 22:33:12.702+00	14397	\N
5b7a518b-71ce-4924-99be-9c68d147342b	\N	Sildenafil/ Tadalafil SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	5	{Sildenafil,Tadalafil}	40mg / 10mg	/images/default-product.png	2025-09-18 22:33:12.673+00	2025-09-18 22:33:12.673+00	14182	\N
5c57b1f6-027d-48a8-ac81-dbb37e33712e	\N	Enclomiphene Citrate SL Tablet	HORMONE THERAPY - Sublingual - COMPOUNDED	1.52	{Enclomiphene}	12.5mg	/images/default-product.png	2025-09-18 22:33:12.648+00	2025-09-18 22:33:12.648+00	14176	\N
6353a369-3e98-49b9-8278-0565cb2943e7	\N	Sermorelin 3mg/mL - 5mL	SERMORELIN - Injection - Manufactured	200	{Sermorelin}	15mg	/images/default-product.png	2025-09-18 22:33:12.617+00	2025-09-18 22:33:12.617+00	14396	\N
65cc8f3e-18e9-4f87-b94c-3a92da9dc055	\N	Ondansetron ODT (Zofran)	WEIGHT LOSS - Tablet - Manufactured	1	{Ondansetron}	4mg	/images/default-product.png	2025-09-18 22:33:12.516+00	2025-09-18 22:33:12.516+00	14258	\N
6a8801b8-3a9f-49a3-b6a3-3a58b220b1e4	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 2mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	240	{Tirzepatide,Methylcobalamin}	34mg / 4mg	/images/default-product.png	2025-09-18 22:33:12.468+00	2025-09-18 22:33:12.468+00	14401	\N
6adbfb18-134d-4ed0-8b8e-d7833ff7c015	\N	Sermorelin Acetate/Glycine Nasal Spray Gel (12mL)	SERMORELIN - Nasal Spray - COMPOUNDED	65	{Sermorelin}	250mcg / 500mcg/0.1mL	/images/default-product.png	2025-09-18 22:33:12.619+00	2025-09-18 22:33:12.619+00	1206	\N
6e470f7d-1280-456a-be90-526b935677fb	\N	NAD+ INJECTION (200mg/ml - 5mL) (NOVA)	WEIGHT LOSS - Injection - Manufactured	200	{NAD+}	1,000mg	/images/default-product.png	2025-09-18 22:33:12.507+00	2025-09-18 22:33:12.507+00	14387	\N
6f2a382e-00ba-4e00-8726-71e357f35ec7	\N	Minoxidil / Finasteride / Ketoconazole	HAIR LOSS - SPRAY - COMPOUNDED	30	{Finasteride,Minoxidil}	5% / 0.1% / 2%- 50ml	/images/default-product.png	2025-09-18 22:33:12.692+00	2025-09-18 22:33:12.692+00	1251	\N
70205e6a-0f1e-443e-966b-816057f80684	\N	Sildenafil 100	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	100mg	/images/default-product.png	2025-09-18 22:33:12.668+00	2025-09-18 22:33:12.668+00	14398	\N
70687f65-7f6c-46c4-b428-269ecd7f3bf4	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	320	{Tirzepatide,Methylcobalamin}	68mg / 8mg	/images/default-product.png	2025-09-18 22:33:12.473+00	2025-09-18 22:33:12.473+00	14405	\N
70b28c2e-2533-4a53-9b40-a1a65cccf94d	\N	Semaglutide Injection (5.0mg/mL - 4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	350	{Semaglutide}	20mg	/images/default-product.png	2025-09-18 22:33:12.437+00	2025-09-18 22:33:12.437+00	14343	\N
722420b9-9ff5-411d-ac11-38647fc5ed00	\N	Estradiol	HORMONE THERAPY - Tablet - Manufactured	0.5	{Estradiol}	1mg	/images/default-product.png	2025-09-18 22:33:12.655+00	2025-09-18 22:33:12.655+00	14222	\N
784a4a0c-bbc8-48bf-a834-0c29031a8731	\N	Tretinoin 0.05%	SKIN/DERMATOLOGY - Cream - Manufactured	50	{Tretinoin}	20gm	/images/default-product.png	2025-09-18 22:33:12.602+00	2025-09-18 22:33:12.602+00	14619	\N
7a3db81c-c982-4daa-bce2-f362460edadc	\N	Sildenafil 50	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	50mg	/images/default-product.png	2025-09-18 22:33:12.672+00	2025-09-18 22:33:12.672+00	14138	\N
8662357b-9828-489c-afa6-0f67dfe0c2a7	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	0.25mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.569+00	2025-09-18 22:33:12.569+00	14198	\N
883be894-f4e4-4934-951a-d31691cc5d33	\N	Trazodone HCl Tablet	SLEEP / ANXIETY / DEPRESSION - Tablet - Manufactured	1	{Trazodone}	50mg	/images/default-product.png	2025-09-18 22:33:12.698+00	2025-09-18 22:33:12.698+00	14294	\N
8aa8fbbb-dceb-44e5-b2f7-4eab8e1e62d5	\N	Clomid (Clomiphene Citrate)	HORMONE THERAPY - Tablet - Manufactured	15	{Clomid}	50mg	/images/default-product.png	2025-09-18 22:33:12.645+00	2025-09-18 22:33:12.645+00	14188	\N
8ac66b54-1ae0-4f5a-abd9-b504b33b0839	\N	Tirzepatide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	8.42	{Tirzepatide}	3mg	/images/default-product.png	2025-09-18 22:33:12.46+00	2025-09-18 22:33:12.46+00	14329	\N
8c584ef6-0249-4fbc-8578-61fde96506d1	\N	Cyanocobalamin B12 (10 mL)	WEIGHT LOSS - Injection - Manufactured	25	{Cyanocobalamin}	1,000 mcg / mL	/images/default-product.png	2025-09-18 22:33:12.48+00	2025-09-18 22:33:12.48+00	14365	\N
916279a1-9f28-4e90-b352-2576428fa7dd	\N	Cabergoline (8 ct.)	FERTILITY / PREGNANCY - Tablet - Manufactured	40	{Cabergoline}	0.5mg	/images/default-product.png	2025-09-18 22:33:12.701+00	2025-09-18 22:33:12.701+00	14151	\N
9342885b-059d-4509-aa4e-d4178a75801c	\N	Naltrexone 5mg SR / L-Carnitine / Inositol	WEIGHT LOSS - Capsule - COMPOUNDED	2	{Naltrexone}	5 / 100/25mg	/images/default-product.png	2025-09-18 22:33:12.514+00	2025-09-18 22:33:12.514+00	1159	\N
9538d25a-d880-4859-ab0d-753404df006a	\N	Sermorelin 1mg/mL - 9mL	SERMORELIN - Injection - Manufactured	170	{Sermorelin}	9mg	/images/default-product.png	2025-09-18 22:33:12.61+00	2025-09-18 22:33:12.61+00	14393	\N
970fe41f-39d7-45ec-88c5-1177376e050c	\N	Sildenafil/ Tadalafil SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	7	{Sildenafil,Tadalafil}	80mg / 20mg	/images/default-product.png	2025-09-18 22:33:12.675+00	2025-09-18 22:33:12.675+00	14183	\N
9a9ed28b-7155-4b8b-877a-51cda8f8f0f1	\N	Semaglutide Injection (2.5mg/mL - 2mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	95	{Semaglutide}	5mg	/images/default-product.png	2025-09-18 22:33:12.426+00	2025-09-18 22:33:12.426+00	14390	\N
a006185e-ca9c-41b7-b18f-8a874386ea54	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	2.5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.58+00	2025-09-18 22:33:12.58+00	14357	\N
a35c67d3-8716-4024-a037-62c9be98b57d	\N	Diethylpropion HCL	WEIGHT LOSS - Tablet - Manufactured	1	{Diethylpropion}	25mg	/images/default-product.png	2025-09-18 22:33:12.482+00	2025-09-18 22:33:12.482+00	14233	\N
a4a8e740-6d6f-49cc-838c-98bf367b370e	\N	Mounjaro	WEIGHT LOSS - Pen-Injector - Manufactured	1223	{Mounjaro}	2.5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.496+00	2025-09-18 22:33:12.496+00	14205	\N
a8dcc808-ed57-41e0-9a74-f83b140ab230	\N	Tretinoin 0.05%	SKIN/DERMATOLOGY - Cream - Manufactured	50	{Tretinoin}	20gm	/images/default-product.png	2025-09-18 22:33:12.604+00	2025-09-18 22:33:12.604+00	14260	\N
a9c2ae46-809e-4b2d-8af9-ca7b6440207e	\N	Tadalafil / Oxytocin / PT-141 (Bremelanotide Acetate) SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	5	{Tadalafil}	20mg / 100iu/2,000mcg	/images/default-product.png	2025-09-18 22:33:12.681+00	2025-09-18 22:33:12.681+00	14160	\N
ac7686b0-7446-4845-abd6-54e1493262a4	\N	Rybelsus	WEIGHT LOSS - Tablet - Manufactured	35	{Rybelsus}	3mg	/images/default-product.png	2025-09-18 22:33:12.535+00	2025-09-18 22:33:12.535+00	2192	\N
ae44df1f-66ad-4206-b256-e58875ff6a61	\N	Rybelsus	WEIGHT LOSS - Tablet - Manufactured	35	{Rybelsus}	7mg	/images/default-product.png	2025-09-18 22:33:12.533+00	2025-09-18 22:33:12.533+00	2193	\N
b0ea1fa4-3809-42de-8dd4-34b53fc68f07	\N	Sildenafil 25	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	25mg	/images/default-product.png	2025-09-18 22:33:12.67+00	2025-09-18 22:33:12.67+00	14368	\N
b4c40c49-255d-4af4-95be-b285d078a540	\N	Ascorbic Acid	VITAMINS/SUPPLEMENTS - Injection - Manufactured	85	{"Ascorbic Acid"}	500mg / mL (50mL)	/images/default-product.png	2025-09-18 22:33:12.704+00	2025-09-18 22:33:12.704+00	14589	\N
b76cf24e-5667-46f6-9535-7e597047fb5e	\N	Sildenafil 20	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	20mg	/images/default-product.png	2025-09-18 22:33:12.669+00	2025-09-18 22:33:12.669+00	14358	\N
b998b9b5-005e-4aad-b29e-2512ea782027	\N	Semaglutide Injection (2.5mg/mL - 4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	175	{Semaglutide}	10mg	/images/default-product.png	2025-09-18 22:33:12.433+00	2025-09-18 22:33:12.433+00	14392	\N
b9fb3f30-6eb3-4150-86c0-6bf778ced755	\N	Progesterone	HORMONE THERAPY - Capsule - Manufactured	1	{Progesterone}	200mg	/images/default-product.png	2025-09-18 22:33:12.664+00	2025-09-18 22:33:12.664+00	14214	\N
baf90f8b-6aa4-4bbc-a7ff-273ed56b9ac1	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	2	{Armour}	0.5 grain (30mg)	/images/default-product.png	2025-09-18 22:33:12.638+00	2025-09-18 22:33:12.638+00	489	\N
bbe6cd19-c9f9-4db1-a6a7-8a00f27d2ec6	\N	Tirzepatide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	11.12	{Tirzepatide}	4mg	/images/default-product.png	2025-09-18 22:33:12.462+00	2025-09-18 22:33:12.462+00	14330	\N
bfc93381-fa04-47d3-8144-9e7a8a8f5a65	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	2.67	{Semaglutide}	1mg	/images/default-product.png	2025-09-18 22:33:12.443+00	2025-09-18 22:33:12.443+00	14289	\N
c004f2dd-3665-464c-9d2c-614cfef2b121	\N	Testosterone Gel 1.62%	TESTOSTERONE THERAPY - Gel - Manufactured	85	{Testosterone}	1.62%	/images/default-product.png	2025-09-18 22:33:12.629+00	2025-09-18 22:33:12.629+00	14140	\N
c3123242-5d24-4e01-a255-b0cafdb3b667	\N	Sermorelin 3mg/mL - 2mL	SERMORELIN - Injection - Manufactured	150	{Sermorelin}	6mg	/images/default-product.png	2025-09-18 22:33:12.612+00	2025-09-18 22:33:12.612+00	14394	\N
c6a157e3-2632-47de-a750-50eef1e23c3b	\N	Minoxidil / Finasteride / Ketoconazole/ Dutasteride	HAIR LOSS - GEL - COMPOUNDED	50	{Finasteride,Minoxidil}	5% / 0.1% / 2% /0.005% - 51gm	/images/default-product.png	2025-09-18 22:33:12.693+00	2025-09-18 22:33:12.693+00	14153	\N
c6e3d71f-51fd-4c49-8fe4-14e97ba6d08a	\N	Rybelsus	WEIGHT LOSS - Tablet - Manufactured	35	{Rybelsus}	14mg	/images/default-product.png	2025-09-18 22:33:12.53+00	2025-09-18 22:33:12.53+00	2194	\N
c82a66db-db91-43a4-b0f4-2c41806385e7	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	7.5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.584+00	2025-09-18 22:33:12.584+00	14354	\N
cf0f9bef-2928-423a-8094-a3212f0c29e5	\N	Testosterone Gel 1.62%	TESTOSTERONE THERAPY - Gel - Manufactured	85	{Testosterone}	1.62%	/images/default-product.png	2025-09-18 22:33:12.628+00	2025-09-18 22:33:12.628+00	14370	\N
cff27b13-67e8-4bb7-a46f-78d84c146c66	\N	Bupropion HCL SR	WEIGHT LOSS - Tablet - Manufactured	0.3	{Bupropion}	150mg	/images/default-product.png	2025-09-18 22:33:12.477+00	2025-09-18 22:33:12.477+00	14231	\N
d2f507a5-8cab-491d-afeb-3671c07c109a	\N	Tadalafil 5	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	2.5	{Tadalafil}	5mg	/images/default-product.png	2025-09-18 22:33:12.686+00	2025-09-18 22:33:12.686+00	14315	\N
d4fe6beb-8d8d-4ac8-8e34-a80c871b03e9	\N	Acarbose/Orlistat	WEIGHT LOSS - Tablet - COMPOUNDED	3	{Acarbose,Orlistat}	30mg / 100mg	/images/default-product.png	2025-09-18 22:33:12.475+00	2025-09-18 22:33:12.475+00	14237	\N
d55768c9-06db-4f78-8003-63b93b8fd96f	\N	Tadalafil	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Tadalafil}	20 mg	/images/default-product.png	2025-09-18 22:33:12.677+00	2025-09-18 22:33:12.677+00	14621	\N
d68e2d61-7884-4e55-84d3-9af48809f160	\N	Testosterone Enanthate	TESTOSTERONE THERAPY - 5mL / Vial - Manufactured	195	{Testosterone}	200mg / mL	/images/default-product.png	2025-09-18 22:33:12.626+00	2025-09-18 22:33:12.626+00	14172	\N
d7f901d5-6d56-42d9-bd13-c3b78ec76dcd	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	18G x 1"	/images/default-product.png	2025-09-18 22:33:12.714+00	2025-09-18 22:33:12.714+00	459	\N
d9ea3f60-6e14-467f-8133-e1a5b1b5b4dc	\N	Anastrozole	HORMONE THERAPY - Capsule - COMPOUNDED	1	{Anastrozole}	0.50mg	/images/default-product.png	2025-09-18 22:33:12.633+00	2025-09-18 22:33:12.633+00	400	\N
da4a15a1-b9bd-42ea-8d61-c3f003249e0f	\N	Sermorelin 3mg/mL - 3mL	SERMORELIN - Injection - Manufactured	160	{Sermorelin}	9mg	/images/default-product.png	2025-09-18 22:33:12.614+00	2025-09-18 22:33:12.614+00	14395	\N
db3e266a-0ca0-461b-a8b9-17062b352f8e	\N	Syringe - Insulin	SYRINGES / MISC. - 1mL - Manufactured	0.25	{Syringe}	30G x 1 / 2 x 1ML	/images/default-product.png	2025-09-18 22:33:12.724+00	2025-09-18 22:33:12.724+00	465	\N
de306b99-cb68-47d8-8630-ca816b98f7cf	\N	Tadalafil 2.5 mg	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	2.5	{Tadalafil}	2.5 mg	/images/default-product.png	2025-09-18 22:33:12.685+00	2025-09-18 22:33:12.685+00	14190	\N
dff788d4-fc73-44f7-be09-2f92a12c6142	\N	Sermorelin Acetate/Glycine SL Tablet	SERMORELIN - Sublingual RDT - COMPOUNDED	2	{Sermorelin}	1000 mcg / 125 mg	/images/default-product.png	2025-09-18 22:33:12.62+00	2025-09-18 22:33:12.62+00	14158	\N
e0a99aab-1a3e-465e-a82a-569297ab56c2	\N	Oxandrolone 25	HORMONE THERAPY - Capsule - COMPOUNDED	4	{Oxandrolone}	25mg	/images/default-product.png	2025-09-18 22:33:12.659+00	2025-09-18 22:33:12.659+00	384	\N
e299d39e-fbb5-45d1-8843-804f23114314	\N	Estradiol	HORMONE THERAPY - Tablet - Manufactured	0.64	{Estradiol}	2mg	/images/default-product.png	2025-09-18 22:33:12.657+00	2025-09-18 22:33:12.657+00	14223	\N
e2a503e4-06ec-47c7-9a28-c0e58b7b2bf5	\N	Saxenda	WEIGHT LOSS - 5 Auto-Injectors - Manufactured	1588	{Saxenda}	18mg / 3mL	/images/default-product.png	2025-09-18 22:33:12.538+00	2025-09-18 22:33:12.538+00	2198	\N
e64de50b-70f3-4c88-a0ea-4464c9546073	\N	Semaglutide/Methylcobalamin Injection (2.5mg/2mg -2mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	95	{Semaglutide,Methylcobalamin}	5mg / 4mg	/images/default-product.png	2025-09-18 22:33:12.456+00	2025-09-18 22:33:12.456+00	14616	\N
e7c61c1f-6bf1-41ce-875b-1995cc7354ca	\N	Tretinoin Cream 0.1% Cream (20g)	SKIN/DERMATOLOGY - CREAM - Manufactured	48.17	{Tretinoin}	0.1%	/images/default-product.png	2025-09-18 22:33:12.608+00	2025-09-18 22:33:12.608+00	14380	\N
e8afb497-5cf7-4043-b93e-357e1f172ddf	\N	Semaglutide/Methylcobalamin Injection (10mg/8mg -4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	175	{Semaglutide,Methylcobalamin}	10mg / 8mg	/images/default-product.png	2025-09-18 22:33:12.452+00	2025-09-18 22:33:12.452+00	14618	\N
e8f89574-66d9-451c-b360-1b5c6cb84471	\N	Acyclovir	SEXUAL HEALTH - 15gm - Manufactured	60	{Acyclovir}	5%	/images/default-product.png	2025-09-18 22:33:12.699+00	2025-09-18 22:33:12.699+00	14366	\N
eb4eca6c-86ba-4d30-abdb-5acf3b9eb924	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	0.5mg / 0.5mL	/images/default-product.png	2025-09-18 22:33:12.567+00	2025-09-18 22:33:12.567+00	14242	\N
ecb41c2d-1873-4f91-91d1-596e4fe8bae6	\N	Acne Astringent (Salicylic Acid/ Niacinamide)	SKIN/DERMATOLOGY - 12mL Spray - COMPOUNDED	25	{Acne}	2% / 5%	/images/default-product.png	2025-09-18 22:33:12.596+00	2025-09-18 22:33:12.596+00	14269	\N
ed820b10-b2bb-4cdd-b498-38c2b4c753a1	\N	Diethylpropion HCL ER	WEIGHT LOSS - Tablet - Manufactured	1.1	{Diethylpropion}	75mg	/images/default-product.png	2025-09-18 22:33:12.483+00	2025-09-18 22:33:12.483+00	14232	\N
f1d8007f-7ca9-44b8-8a89-5a3bc4511e88	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	2.4mg / 0.75mL	/images/default-product.png	2025-09-18 22:33:12.574+00	2025-09-18 22:33:12.574+00	1588	\N
f35e4739-07dc-42e5-ac44-7733b5a941dc	\N	Alcohol Prep Pad	SYRINGES / MISC. - Each - Manufactured	0.05	{Alcohol}	——	/images/default-product.png	2025-09-18 22:33:12.709+00	2025-09-18 22:33:12.709+00	358	\N
f98f57e0-8998-4ddd-b0ba-82d3ec3ce933	\N	Bacteriostatic Water (Manufactured)	SYRINGES / MISC. - 30mL - Manufactured	10	{Bacteriostatic}	——	/images/default-product.png	2025-09-18 22:33:12.71+00	2025-09-18 22:33:12.71+00	418	\N
fa05060d-a14c-472b-bfd3-4b0761b31922	\N	Tadalafil 10	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	2.5	{Tadalafil}	10mg	/images/default-product.png	2025-09-18 22:33:12.683+00	2025-09-18 22:33:12.683+00	14314	\N
fa8943a9-7c84-4aad-8a9d-f7e29787cf54	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	20g x 1”	/images/default-product.png	2025-09-18 22:33:12.716+00	2025-09-18 22:33:12.716+00	429	\N
fb309063-48fe-4f77-a243-2552b3dc254e	\N	Semaglutide/Methylcobalamin Injection (2.5mg/2mg -1mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	85	{Semaglutide,Methylcobalamin}	2.5mg / 2mg	/images/default-product.png	2025-09-18 22:33:12.454+00	2025-09-18 22:33:12.454+00	14615	\N
fc6f43f2-0f92-4266-ae70-fab26e4c69fd	\N	Estradiol	HORMONE THERAPY - Tablet - Manufactured	0.45	{Estradiol}	0.5mg	/images/default-product.png	2025-09-18 22:33:12.653+00	2025-09-18 22:33:12.653+00	14221	\N
88845bcb-6604-42b8-b7b1-bbb50e7407f5	2025-09-25 04:15:22.264+00	Some New Product	Some New Product Description	199	{Somethingglutide}	500mg		2025-09-25 04:03:12.699+00	2025-09-25 04:15:22.265+00		6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
6b5f7ab4-0da0-4068-9309-d53cda0b2244	2025-09-25 04:23:32.139+00	Some Product	Some Product Description	133	{Acetaminophen}	500mg		2025-09-25 04:22:45.914+00	2025-09-25 04:23:32.139+00		6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
8ed65a57-5402-4c89-9331-a7dbd1ce1f79	2025-09-25 04:27:51.547+00	Some New Product	Some New Product Desc	133	{}	500mg		2025-09-25 04:24:00.94+00	2025-09-25 04:27:51.548+00		6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
afd0cfa5-7d1d-4fe8-a0b1-10da144a26be	2025-09-25 04:32:31.771+00	Some New	Some New	133	{}	500mg	https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1758774739814-bird.jpg	2025-09-25 04:28:27.097+00	2025-09-25 04:32:31.771+00		6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
a1e9645f-26db-436b-b2f9-85980b100547	\N	Brande New Product	Brande New Product Description	133	{}	500mg	https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1758775118672-bird.jpg	2025-09-25 04:38:37.863+00	2025-09-25 04:38:38.754+00		6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
ef8c8a97-ccae-4e4d-99c6-0444631def31	2025-09-25 04:33:07.178+00	Great Product	Great Product	133	{}		https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1758774779492-bird.jpg	2025-09-25 04:32:58.905+00	2025-09-25 04:33:07.178+00		6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
\.


--
-- TOC entry 5796 (class 0 OID 24367)
-- Dependencies: 229
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Question" (id, "deletedAt", "questionText", "answerType", "isRequired", "questionOrder", placeholder, "helpText", "stepId", "createdAt", "updatedAt", "footerNote", "questionSubtype", "conditionalLogic", "subQuestionOrder", "conditionalLevel") FROM stdin;
2269743e-0631-4e7e-8397-fab78bdd3f72	\N	Date of Birth	date	t	1	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
5a6e852b-6733-43c6-a3c8-42793f4fd56d	\N	Sex assigned at birth	radio	t	2	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
df2125a6-3da0-45da-b496-5da9f5faa9a7	\N	Phone Number	phone	t	3	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
44d0682b-31af-450b-87e4-fc814322344d	\N	Zip Code	text	t	4	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
c5a78559-7119-4d28-938b-e71dcf88440c	\N	Height	height	t	1	\N	\N	1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
5e612ca9-eba3-4ebf-b588-90a855d1139f	\N	Weight	weight	t	2	\N	\N	1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
9eaf9682-3de3-4e5b-b002-cad5921c02d3	\N	Have you ever been diagnosed with any of the following?	checkbox	t	1	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
81008033-750c-485f-a5ee-804ddfcddb72	\N	Do you have any allergies? (Food, medications, supplements, dyes, other)	textarea	f	2	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
51f63ea3-3b73-4e80-be9b-0318feda8e19	\N	Please list current medications, herbals, or supplements (Name, dose, reason)	textarea	f	3	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
3b9551a0-98a4-4abb-9692-88c38b66c693	\N	Have you had any recent surgeries or hospitalizations?	radio	t	4	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
af568dc4-b13b-47d3-b039-a2fdb2265d1a	\N	Are you currently pregnant, breastfeeding, or planning pregnancy?	radio	t	5	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	\N	Do you smoke or vape?	radio	t	1	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
893d96c7-e2ef-4902-8c85-714acec7e771	\N	Do you consume alcohol?	radio	t	2	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
4695b661-47a1-4e90-a084-377568871f41	\N	How often do you exercise?	radio	t	3	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
257b17ee-3c74-421d-a2b2-6edfe2faeb00	\N	How would you describe your stress level?	radio	t	4	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
b05e3509-149d-4c5a-a6df-3d29f5a7a186	\N	How many hours of sleep do you typically get?	radio	t	5	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
4a03f66e-3724-479c-8e56-3a33aa70df9e	\N	What are your goals with NAD+ treatment? (Select all that apply)	checkbox	t	1	\N	\N	615e5d08-0e76-4efd-b7b6-6e879ac30358	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N	\N	0
2c94c842-10cf-40c6-802b-26d8e13b8928	\N	Have you ever tried NAD+ before?	radio	t	1	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N	\N	0
efcc28e9-18c6-4ceb-abb6-b5e5e9d5145c	\N	If yes, what benefits did you notice?	textarea	f	2	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N	\N	0
44208bc8-1fe1-4b7e-a5a1-6053e6610f18	\N	If no, what interests you most about NAD+?	textarea	f	3	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N	\N	0
19149d80-8ec6-433b-8e28-22161521fc05	\N	How often are you looking to use NAD+?	radio	t	1	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N	\N	0
22389579-ea11-4476-9031-99c68bc8cfbf	\N	What kind of results are you hoping to achieve in the first 30 days?	checkbox	t	2	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N	\N	0
683a9ef3-e655-4cd9-be8f-33a7c7660ff7	\N	Other results you hope to achieve (optional)	textarea	f	3	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N	\N	0
9c863db3-eeee-4e7e-a956-09481aec7d46	\N	What is your main goal with weight loss medication?	radio	t	1	\N	Please select the primary reason you're seeking treatment.	494573f0-07e4-41cd-96d6-216a8f15aadc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
b410a34a-6eeb-4134-8dc1-18f7d9401389	\N	Have you tried losing weight before?	radio	t	1	\N	This helps us understand your journey.	8a345b19-211e-49c5-9d81-b7b868f9c537	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	\N	What is the main difficulty you face when trying to lose weight?	radio	t	1	\N	Select the one that applies most to you.	f7f9d3d9-ea39-4103-9b10-644a41f84a1e	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	\N	What state do you live in?	select	t	1	\N	We need to verify our services are available in your location.	fce69cde-4d4c-4465-a251-e929522ba024	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
fda21e98-558b-474b-837f-01611474391d	\N	What's your gender at birth?	radio	t	1	\N	This helps us provide you with personalized care.	54f9762f-a900-4325-a04a-ab5afcec282d	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
c98a86f7-d5d8-4965-a38d-022502ad951a	\N	What's your date of birth?	date	t	1	\N	We need to verify you're at least 18 years old.	ecaa2116-ce93-4bb0-b869-c84f740bdffc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
ddcdada6-739b-4d4f-a6c1-8c3bb0914fdc	\N	First Name	text	t	1	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
bfbb9599-1eda-44ac-8387-0b83f24c6998	\N	Last Name	text	t	2	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
f3b0e54a-4a37-4d1e-9a5c-62cbffc37320	\N	Email Address	email	t	3	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
1cf8722b-d826-4b0d-8b24-109210be9b9d	\N	Mobile Number (US Only)	phone	t	4	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
a5e32329-80d2-4ae4-acb0-8d3a94273c54	\N	Current Weight (pounds)	number	t	1	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
b0258a7c-2ce9-4da3-8567-51f068f20ac0	\N	Height (feet)	number	t	2	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
b33e5222-2755-4b10-96e2-ce5ede1288c7	\N	Height (inches)	number	t	3	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
a19c5e29-aba2-4a75-94c2-8538df51f23c	\N	Do you have any of these medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	8e41a76d-cb19-4efd-af93-6b1a55242cc3	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
c6f43c4d-f86f-4b24-8beb-2f5833ebb296	\N	Do you have any of these serious medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	d12604a8-5711-4cf4-9946-617c4f12a97c	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
eafa5812-6375-411c-b01a-fbf2df80b2c9	\N	Are you allergic to any of the following?	checkbox	t	1	\N	Select all that apply to help us ensure your safety.	81c71333-a59c-4c63-b6cd-7159c636851d	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
20f6d250-fbbc-488b-b26c-f1c80368f2a0	\N	Are you currently taking any medications?	radio	t	1	\N	Please list all medications, vitamins, and supplements.	54c7c986-ca72-481a-b6f4-c0bc68b595bc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
e003789e-1383-4e9e-9065-713ae3216a11	\N	Are you currently taking any of the following medications?	checkbox	t	1	\N	Select all that apply.	29165ffd-1067-45a3-b5c9-28209e9865d2	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
9d1e551f-a636-4f99-b6ad-0c435b35999d	\N	Please list all medications, vitamins, and supplements	textarea	f	2	Please list all medications, vitamins, and supplements you are currently taking...	\N	54c7c986-ca72-481a-b6f4-c0bc68b595bc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	questionOrder:1,answer:Yes, I take medications	\N	0
2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	\N	Which medication WERE YOU LAST ON?	radio	f	2	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	questionOrder:1,answer:Yes, I have taken weight loss medications before.	\N	0
76e875ad-1914-4a24-b1cd-e907bdf0bbea	\N	Goal Weight (pounds)	number	t	1	\N	Enter your target weight in pounds.	4479a22d-7b23-4937-bae3-2f0eff0dbdba	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	<b>You're taking the first step!</b> Our medical team will create a personalized plan\n  based on your goals.	Lbs	\N	\N	0
f1059dae-2daf-442b-ba86-e17917c4b43e	\N	Have you taken weight loss medications before?	radio	t	1	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N	\N	0
627cc6c0-41a2-4181-9a55-85470b23fb17	\N		textarea	f	24	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:10:01.411803+00	2025-09-19 05:10:01.411803+00	\N	\N	questionOrder:23,answer:Yes	4	2
9149cfe8-1aa7-4a2f-80ee-b74c16e6e914	\N	What dose were you on?	text	f	3	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:36:54.222875+00	2025-09-19 04:36:54.222875+00	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	\N	1
a596dbc1-348b-43df-9aec-85001801f6bd	\N	When did you last take it?	text	f	4	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:39:12.254894+00	2025-09-19 04:39:12.254894+00	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	\N	1
16f3832e-e9e3-4b39-99f6-423f1907f623	\N		textarea	f	9	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:49:06.672662+00	2025-09-19 04:49:06.672662+00	\N	\N	questionOrder:5,answer:Yes	4	2
4f7761ce-95cb-4a5f-92f6-7533206f4822	\N	What dose were you on?	text	f	11	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:54:54.001845+00	2025-09-19 04:54:54.001845+00	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	\N	1
ce1c461a-e062-41bc-8cbc-6c6a86582ccf	\N	When did you last take it?	text	f	12	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:55:10.810652+00	2025-09-19 04:55:10.810652+00	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	\N	1
544ddd65-572d-4b81-8910-b8a052a7ee6f	\N		textarea	f	14	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:52:38.796735+00	2025-09-19 04:52:38.796735+00	\N	\N	questionOrder:13,answer:Yes	4	2
b1de48b4-3a84-410e-a754-dd752269aaa7	\N		textarea	f	22	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:02:29.13368+00	2025-09-19 05:02:29.13368+00	\N	\N	questionOrder:21,answer:Yes	4	2
3698b8cc-91f8-4f60-900f-c9dac8b7a40f	\N	What dose were you on?	text	f	19	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:00:54.991934+00	2025-09-19 05:00:54.991934+00	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	\N	1
83a7a166-ddd4-4ffb-8614-9df92739cf57	\N	When did you last take it?	text	f	20	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:00:54.991934+00	2025-09-19 05:00:54.991934+00	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	\N	1
a0371b68-6e77-4ba1-9c40-686f6af2cf62	\N	What dose were you on?	text	f	25	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:08:47.41765+00	2025-09-19 05:08:47.41765+00	\N	\N	questionOrder:2,answer:Other weight loss medication	1	1
cac7b0cd-f108-4312-9c9c-42c96e4e7fbb	\N	When did you last take it?	text	f	26	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:08:56.401484+00	2025-09-19 05:08:56.401484+00	\N	\N	questionOrder:2,answer:Other weight loss medication	2	1
1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	\N	Did you experience any side effects?	radio	f	5	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:43:23.788211+00	2025-09-19 04:43:23.788211+00	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	3	1
b0fce918-96fb-4012-a1d1-9fe8fe81925f	\N	Did you experience any side effects?	radio	f	13	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:51:13.406514+00	2025-09-19 04:51:13.406514+00	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	3	1
93f87772-01fa-4864-a7c6-bf8efc8493f9	\N	Did you experience any side effects?	radio	f	21	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:01:56.978184+00	2025-09-19 05:01:56.978184+00	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	3	1
86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	\N	Did you experience any side effects?	radio	f	23	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:09:06.639732+00	2025-09-19 05:09:06.639732+00	\N	\N	questionOrder:2,answer:Other weight loss medication	3	1
\.


--
-- TOC entry 5797 (class 0 OID 24380)
-- Dependencies: 230
-- Data for Name: QuestionOption; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."QuestionOption" (id, "deletedAt", "optionText", "optionValue", "optionOrder", "questionId", "createdAt", "updatedAt") FROM stdin;
b1e33cd7-0542-4a93-a75d-7df9de937787	\N	Male	male	1	5a6e852b-6733-43c6-a3c8-42793f4fd56d	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
b57eb716-0260-45df-b63e-d794dd6a361b	\N	Female	female	2	5a6e852b-6733-43c6-a3c8-42793f4fd56d	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
121b14b5-26ae-48fa-8cf0-c25b04789bdb	\N	Other	other	3	5a6e852b-6733-43c6-a3c8-42793f4fd56d	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
529068e9-89c5-4ed4-9ee8-97b0e2938ac8	\N	Stroke	stroke	1	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
3eda4dd8-83d8-4e8f-98ea-155686549e0d	\N	Heart Disease	heart_disease	2	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
6f0930e7-1454-4dda-bc8a-7c064ca937e8	\N	High Blood Pressure	high_blood_pressure	3	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
1085b546-cc5f-4940-912a-ded83cfd2e2f	\N	Diabetes	diabetes	4	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
503b5009-6519-423b-98ea-112b5555c006	\N	Seizures	seizures	5	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
93cb92e3-fddc-4b9b-890e-3e9a03910352	\N	Fatty Liver	fatty_liver	6	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
5948e09f-ad4a-4e18-a022-5fe37ebb0102	\N	Gallstones	gallstones	7	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
3c117e84-1d81-4991-bac2-ed6b4547a3b8	\N	Obstructive Sleep Apnea	obstructive_sleep_apnea	8	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
ae79ab93-d86e-40f7-b9ed-eb846342627a	\N	Kidney Disease	kidney_disease	9	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
a388aaf2-e574-455c-9d3f-bf7771970bc6	\N	Cancer	cancer	10	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
5f9d7556-bb4e-4dd9-aca4-4a3cd6650565	\N	None	none	11	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
5ce04bc6-5929-439d-a797-1f87293cf67f	\N	Yes	yes	1	3b9551a0-98a4-4abb-9692-88c38b66c693	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
58e56af7-37b5-4258-b2dc-27d7b2a4f5a6	\N	No	no	2	3b9551a0-98a4-4abb-9692-88c38b66c693	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
c7cffdac-5346-4978-b77f-4a345b91e2cb	\N	Yes	yes	1	af568dc4-b13b-47d3-b039-a2fdb2265d1a	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
fa233792-9892-4cb4-8e57-1bdb71cd634e	\N	No	no	2	af568dc4-b13b-47d3-b039-a2fdb2265d1a	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
58dff435-6156-430e-84ff-9935d8f88f39	\N	Yes	yes	1	08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
45a9ca03-4f6d-4fb4-9370-76554fffe9b6	\N	No	no	2	08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
aa568d79-8760-456f-ad2a-451fdbfaddca	\N	Yes	yes	1	893d96c7-e2ef-4902-8c85-714acec7e771	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
5bc683ee-6017-4f3d-a9f5-32c5783b625d	\N	Occasionally	occasionally	2	893d96c7-e2ef-4902-8c85-714acec7e771	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
ecd28f7c-66c7-4fb8-aea2-99a2801ee5a3	\N	No	no	3	893d96c7-e2ef-4902-8c85-714acec7e771	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
35d6f55a-e82b-4365-af3e-61044c5dab53	\N	Daily	daily	1	4695b661-47a1-4e90-a084-377568871f41	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
d1f23c05-f36c-4d3e-971f-fe74b9afbf17	\N	Few times a week	few_times_a_week	2	4695b661-47a1-4e90-a084-377568871f41	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
8f7de0fd-dbf2-4d92-82c3-70041715bb95	\N	Rarely	rarely	3	4695b661-47a1-4e90-a084-377568871f41	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
51854dbd-7f6f-4baa-a2d7-f3013f552d5a	\N	Never	never	4	4695b661-47a1-4e90-a084-377568871f41	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
841d5b66-e14a-4ddf-bf94-f5b615cfd423	\N	Low	low	1	257b17ee-3c74-421d-a2b2-6edfe2faeb00	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
d50f98a6-a393-4292-b2b2-05c871d5f2ed	\N	Moderate	moderate	2	257b17ee-3c74-421d-a2b2-6edfe2faeb00	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
af95f651-c034-431d-bcfc-6138e9ceff86	\N	High	high	3	257b17ee-3c74-421d-a2b2-6edfe2faeb00	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
83e8582f-a7aa-4807-ab9d-d3eb17cc89e0	\N	<5 hours	5	1	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
0aa7cc37-66f8-4f33-8a93-7f38a9d77d46	\N	5–7 hours	57	2	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
76460de9-ce9e-48ad-921b-a7e972c497a1	\N	7–9 hours	79	3	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
0558729d-44f5-482e-bed2-2ec9c110c5a0	\N	>9 hours	9	4	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00
b89c3312-2a3d-4314-bd7f-f4451bce5a92	\N	To boost daily energy and reduce fatigue	to_boost_daily_energy_and_reduce_fatigue	1	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
d9fee3a3-f30c-493d-a9f1-db8395bffdc9	\N	To improve focus, memory, and mental clarity	to_improve_focus_memory_and_mental_clarity	2	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
de027da5-0caf-4b59-9d32-e4de03f7986e	\N	To support healthy aging / longevity	to_support_healthy_aging_longevity	3	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
13affe09-3281-4ba2-a918-4b3a9a903b9f	\N	To restore cellular health and repair DNA	to_restore_cellular_health_and_repair_dna	4	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
e15f9c5f-9f8a-4b3f-b360-016cfb3dc501	\N	To speed up recovery from stress or overexertion	to_speed_up_recovery_from_stress_or_overexertion	5	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
234e5510-a982-4541-8a6f-971ea8534c85	\N	To stabilize mood and emotional balance	to_stabilize_mood_and_emotional_balance	6	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
99cca921-0abf-4c9c-94bc-f64489782a9c	\N	To improve metabolism and weight management	to_improve_metabolism_and_weight_management	7	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
35687ffe-57d8-4356-b506-653dca9bc5db	\N	To improve sleep quality	to_improve_sleep_quality	8	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
74ea2f3b-4437-4ab3-80b5-048ebf55537a	\N	To detox and support overall wellness	to_detox_and_support_overall_wellness	9	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
12880ed7-0452-4672-b05e-4a3c0e94cd65	\N	To feel good and function at my best	to_feel_good_and_function_at_my_best	10	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
b9a2b2d7-a615-4f3b-a3f4-1212b12a1def	\N	Yes	yes	1	2c94c842-10cf-40c6-802b-26d8e13b8928	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
7c35bc19-ef18-4151-9d19-36a4e151a672	\N	No	no	2	2c94c842-10cf-40c6-802b-26d8e13b8928	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
f0224e2e-a8de-4556-b33b-c788b77b41b8	\N	One-time session (trial)	onetime_session_trial	1	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
b088da41-7e45-4265-998e-7f7e399b0d77	\N	Monthly maintenance	monthly_maintenance	2	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
3ec5b44e-e68a-4c8c-91d5-c385af97dce4	\N	Bi-weekly optimization	biweekly_optimization	3	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
35a65d94-db81-4595-ac98-e6c59647aae4	\N	Weekly peak results	weekly_peak_results	4	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
48938806-a65b-4f3e-81ec-1fdf5a1ca73f	\N	More energy + focus	more_energy_focus	1	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
7ff2b0b3-6a49-4cbc-9f97-27e8e2eba3e2	\N	Better sleep + recovery	better_sleep_recovery	2	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
9775aa4b-d3d6-40de-9a87-007235630224	\N	Longevity + anti-aging support	longevity_antiaging_support	3	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
e460ba82-c67a-4ddb-8f22-69ff80efabb4	\N	Mood + stress balance	mood_stress_balance	4	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00
5a9ea665-032e-4138-9c4c-e3b0c0282ad5	\N	Improve health	Improve health	1	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
61ab98d7-88a2-4180-b22f-a312c16652c1	\N	Feel better about myself	Feel better about myself	2	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1be6cad8-f506-4228-af47-21a5843fdb45	\N	Improve quality of life	Improve quality of life	3	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
76e2956a-d872-4093-b0f6-a2d2cd66a8bb	\N	All of the above	All of the above	4	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
8275e6ed-68a8-4015-bc11-de033fb41a25	\N	Yes, I have tried diets, exercises, or other methods.	Yes, I have tried diets, exercises, or other methods.	1	b410a34a-6eeb-4134-8dc1-18f7d9401389	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d18fb688-f307-46e0-b137-c829fe207045	\N	No, this is my first time actively trying to lose weight.	No, this is my first time actively trying to lose weight.	2	b410a34a-6eeb-4134-8dc1-18f7d9401389	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
3478facc-2116-4519-923b-97fc9771aa76	\N	Dealing with hunger/cravings	Dealing with hunger/cravings	1	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c117f798-8aea-4157-ab61-e066a746805f	\N	Not knowing what to eat	Not knowing what to eat	2	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
a85c516d-96e3-4fd4-9862-9c4d18f5dc34	\N	It was taking too long	It was taking too long	3	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
02e0754a-f1c6-4ff5-9cac-156b9cbd8e89	\N	Not staying motivated	Not staying motivated	4	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5f137878-fa65-4a0f-85ef-f943fce66696	\N	All of the above	All of the above	5	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c2c902f6-e07f-464c-aff8-e1af39e503a5	\N	Alabama	Alabama	1	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
27480e68-f410-4be5-8c46-9780cac89630	\N	Alaska	Alaska	2	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
64e4e96e-6b8f-4176-96c6-3bfc1b94b7df	\N	Arizona	Arizona	3	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
76556884-4191-4b6f-b3a7-7a8166e0573f	\N	Arkansas	Arkansas	4	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
486e9898-28fb-41cd-9ce9-b7dbdf889601	\N	California	California	5	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1a278ffb-9c1e-4dae-8dba-6dab7886004f	\N	Colorado	Colorado	6	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
3cbc3a18-7582-4503-a0e0-c4a8ccecfed6	\N	Connecticut	Connecticut	7	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
13dc130b-daea-4c0d-96d7-487117c3b04e	\N	Delaware	Delaware	8	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9c55281b-9f17-44f0-9b9d-2cc11459004a	\N	Florida	Florida	9	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
7233f7cf-973a-4d76-bf22-a7ae14650461	\N	Georgia	Georgia	10	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
f694f532-2d82-4ff4-a958-2cfd27904813	\N	Hawaii	Hawaii	11	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
b8cccbb5-651b-43ac-bc69-5d2091eb28cc	\N	Idaho	Idaho	12	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1bdf87de-a5db-4f88-8bd6-2660e33430be	\N	Illinois	Illinois	13	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c4c955d7-8f1c-43c4-8b60-1d9187835863	\N	Indiana	Indiana	14	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
79a7bcf7-827b-4870-b863-45d80d233089	\N	Iowa	Iowa	15	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
853744b3-92ff-4531-865b-d25aea4c3ba7	\N	Kansas	Kansas	16	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
66f6da19-96ab-4816-ab8a-5b53f80811b5	\N	Kentucky	Kentucky	17	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
fee0a89c-6bb9-43f4-9519-cd8d551f75d9	\N	Louisiana	Louisiana	18	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
ce671169-bbfb-41ad-984b-07c90ea75373	\N	Maine	Maine	19	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c1f0286b-0a18-4530-8cf4-266840c0bcb6	\N	Maryland	Maryland	20	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
aef5597b-b106-4144-abff-f69cca82ccfc	\N	Massachusetts	Massachusetts	21	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
bef9a05b-0e13-4199-93f2-d68d64cbce76	\N	Michigan	Michigan	22	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
8ac4ea8b-0795-4548-b515-59a220d25799	\N	Minnesota	Minnesota	23	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
cd70f5b3-cba6-4ec7-8df4-f8e07303f468	\N	Mississippi	Mississippi	24	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
f2ed3c04-1bc8-4c12-b393-ea27fd7cdbcb	\N	Missouri	Missouri	25	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
61fc001e-ea04-4e8a-a792-d814b715904d	\N	Montana	Montana	26	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6c175917-5bfd-4df8-b459-0ab2ec452a35	\N	Nebraska	Nebraska	27	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d4fb410e-c6da-4252-bf4e-07f6c12576b2	\N	Nevada	Nevada	28	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
ef903b21-efe8-4938-8ab8-ae931b5970f6	\N	New Hampshire	New Hampshire	29	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1386acb4-749e-409f-8d06-67f17c4ec03f	\N	New Jersey	New Jersey	30	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c2a14071-00ec-469f-a707-02fbcfa83d4b	\N	New Mexico	New Mexico	31	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
594a4236-cd37-4c5b-ad38-4b679dc7db88	\N	New York	New York	32	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
03325e8c-2f55-4cb9-bdeb-a82cb5b576a8	\N	North Carolina	North Carolina	33	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
287054c0-fb6f-4b4d-90f0-95f500dd93ec	\N	North Dakota	North Dakota	34	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
34c7ebea-24bd-433c-ae9c-8385d5f8fc94	\N	Ohio	Ohio	35	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
955d39bd-17fd-4700-9b77-796bc2d9c5a8	\N	Oklahoma	Oklahoma	36	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
7e9b6ad6-7cb7-4f72-ba98-662bb0c29e7c	\N	Oregon	Oregon	37	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
4a0c1c16-2f2c-45dd-bff2-cbd61677d0f2	\N	Pennsylvania	Pennsylvania	38	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
8cae91a4-c1c7-49c6-a93f-7b544e9d8014	\N	Rhode Island	Rhode Island	39	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
a297cfd0-f1b7-4c97-9eb3-03b18a1856ee	\N	South Carolina	South Carolina	40	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6130bf70-c356-4c79-8c50-8c32c1181939	\N	South Dakota	South Dakota	41	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
00226523-18c3-4652-bba6-7b582038bb55	\N	Tennessee	Tennessee	42	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
4190e39c-0f06-49c8-a2ae-b41f97ffa1db	\N	Texas	Texas	43	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
b736a428-9e14-4caf-8d02-9a48dff4f5a2	\N	Utah	Utah	44	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c7216177-e0d8-435c-af85-2d52b0ee5c46	\N	Vermont	Vermont	45	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5c7f7f1a-f8c0-47bf-ace9-9f5bdb7bc38a	\N	Virginia	Virginia	46	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5bc28b5d-a4d5-4530-807f-c04ffc66e409	\N	Washington	Washington	47	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6440cf80-7602-4270-9b89-91e56794afdd	\N	West Virginia	West Virginia	48	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
027eb892-d496-4788-9422-402b4ec9e8fc	\N	Wisconsin	Wisconsin	49	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
b613a132-7f22-4bf1-899a-ee222132245c	\N	Wyoming	Wyoming	50	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6a3408e9-1241-4fa4-833d-9a373c14273e	\N	Male	Male	1	fda21e98-558b-474b-837f-01611474391d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d7d95218-83b7-4d64-bf2a-3284612fb7d5	\N	Female	Female	2	fda21e98-558b-474b-837f-01611474391d	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
773a2b2a-334d-4c6d-9e4d-d4486954afdb	\N	None of the above	None of the above	1	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5093f753-3fd5-4a59-9044-5658cd026d97	\N	Gallbladder disease or removal	Gallbladder disease or removal	2	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
88d90152-5831-4c75-a576-0d32955a7411	\N	Hypertension	Hypertension	3	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
8065f32f-9ac6-4bce-b5e4-7bdb87abea97	\N	High cholesterol or triglycerides	High cholesterol or triglycerides	4	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6e98c26f-a8e7-4651-850a-5bac8f5bc702	\N	Sleep apnea	Sleep apnea	5	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d5a64ba0-3ef9-4c4b-bf55-d60d6c29225b	\N	Osteoarthritis	Osteoarthritis	6	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
b887ecc0-6cfa-4c65-9368-24683c780529	\N	Mobility issues due to weight	Mobility issues due to weight	7	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9859f52a-742a-4ba9-bf43-63a3ff8adf2e	\N	GERD	GERD	8	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d56b5a5d-2cd1-4bb4-b5ae-8e4a74a4a612	\N	PCOS with insulin resistance	PCOS with insulin resistance	9	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
77d8f024-e554-49fc-a139-be8df68753d1	\N	Liver disease or NAFLD	Liver disease or NAFLD	10	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c24d8762-1ff9-45d7-987d-14d13aa86d29	\N	Heart disease	Heart disease	11	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
a3131639-cb0f-4db2-b678-52671ac6d234	\N	Metabolic syndrome	Metabolic syndrome	12	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
da3af391-34b5-411b-bf58-b25343a84852	\N	Chronic kidney disease (Stage 3+)	Chronic kidney disease (Stage 3+)	13	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c8669e1e-a485-4ea8-b04d-0e150467589f	\N	SIADH	SIADH	14	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9f38c4a2-a264-46cd-86b7-e1ed58545c50	\N	Thyroid conditions	Thyroid conditions	15	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d8764054-8dd9-4a1e-9211-abd937cd528b	\N	Prediabetes	Prediabetes	16	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
e1b57e4c-73a1-4e7c-985a-6253d4a14e94	\N	Type 2 diabetes	Type 2 diabetes	17	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
ebe464c5-fa94-4b01-9cbb-b74ce189d025	\N	Gastroparesis	Gastroparesis	18	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
69ce1933-68c8-42fc-b26e-466b52072c2a	\N	IBD (Crohn's or Colitis)	IBD (Crohn's or Colitis)	19	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
2a07913b-94ef-4d3b-925f-ed0655242a22	\N	None of the above	None of the above	1	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
e3bd6072-ab5c-4be5-be47-00f385d0cb54	\N	Gastroparesis (Paralysis of your intestines)	Gastroparesis (Paralysis of your intestines)	2	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
41c44967-fd52-4cfc-afe2-ee2db55ff303	\N	Triglycerides over 600 at any point	Triglycerides over 600 at any point	3	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
666bcce8-b69e-469f-9069-e07444fb6e30	\N	Pancreatic cancer	Pancreatic cancer	4	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5ea86b44-0dc9-4357-9a7d-04dc60bb7d91	\N	Pancreatitis	Pancreatitis	5	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6e3edeae-4cb9-4078-9850-3cb0a80e36f6	\N	Type 1 Diabetes	Type 1 Diabetes	6	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1fef9d60-8a08-4984-8632-ecee03b82171	\N	Hypoglycemia (low blood sugar)	Hypoglycemia (low blood sugar)	7	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5a63d424-3371-4afa-8ac3-787277a4239a	\N	Insulin-dependent diabetes	Insulin-dependent diabetes	8	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
c7e40d4f-3f8c-4a3f-bfb5-4637bf2c58f6	\N	Thyroid cancer	Thyroid cancer	9	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
82b49055-b7e9-4ac8-b648-8b56cd7165cd	\N	Family history of thyroid cancer	Family history of thyroid cancer	10	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
cdbf19d5-cd1e-46de-8f7c-c83d533c0380	\N	Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome	Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome	11	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1ea8ec6c-30aa-4fff-bef7-d1f2e64c55ca	\N	Anorexia or bulimia	Anorexia or bulimia	12	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
fc70cb4a-a57e-49e8-9ea2-63175d81131c	\N	Current symptomatic gallstones	Current symptomatic gallstones	13	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
77d0d1f5-d29c-46e7-aa29-74919854acaf	\N	None of the above	None of the above	1	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
ef482d5c-42f6-403a-949f-ec844d7528c7	\N	Ozempic (Semaglutide)	Ozempic (Semaglutide)	2	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
de1cfbea-c413-492e-8625-d0e94a207dd7	\N	Wegovy (Semaglutide)	Wegovy (Semaglutide)	3	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9e6bfb4d-14ed-4099-b81f-61da175306d8	\N	Zepbound (Tirzepatide)	Zepbound (Tirzepatide)	4	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
15c35b35-47ff-401c-a23f-c09e3d2d8d20	\N	Mounjaro (Tirzepatide)	Mounjaro (Tirzepatide)	5	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
87e9853b-9ceb-4253-b6b3-d25e3c0c4ee0	\N	Saxenda (Liraglutide)	Saxenda (Liraglutide)	6	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
cf7b2b94-64dd-4525-907d-efb7e4efce2f	\N	Trulicity (Dulaglutide)	Trulicity (Dulaglutide)	7	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9ff06138-b75a-4e51-80b9-012a177998e3	\N	No, I don't take any medications	No, I don't take any medications	1	20f6d250-fbbc-488b-b26c-f1c80368f2a0	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
e1a6851b-07d0-47f0-8de4-a0ceac100690	\N	Yes, I take medications	Yes, I take medications	2	20f6d250-fbbc-488b-b26c-f1c80368f2a0	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
f9ffd7ab-9e7c-4e45-8d3c-7ce539af043f	\N	None of the above	None of the above	1	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
60914b2a-3b0e-46be-a9dc-9cb7fb01b5a3	\N	Insulin	Insulin	2	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
d6c4eb64-4b08-4199-a958-b4d91dc73b3f	\N	Glimepiride (Amaryl)	Glimepiride (Amaryl)	3	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
e2fe1638-a7af-4054-9bbe-2e170d742338	\N	Meglitinides (e.g., repaglinide, nateglinide)	Meglitinides (e.g., repaglinide, nateglinide)	4	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9e559f02-0b14-419c-ba0e-75c6536da6e3	\N	Glipizide	Glipizide	5	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
3bef8f7e-ae1e-48b9-ba47-d4c7354a1080	\N	Glyburide	Glyburide	6	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
6b808984-91c1-4ce9-b59e-c1c66186e1b4	\N	Sitagliptin	Sitagliptin	7	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
09ea5860-c813-4c53-a816-deb4855f8177	\N	Saxagliptin	Saxagliptin	8	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
24a28461-0b12-4eb0-a0ff-ae8bba91e37c	\N	Linagliptin	Linagliptin	9	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
9fec6d9f-a14c-423f-8dee-e22bbf0de67a	\N	Alogliptin	Alogliptin	10	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
701b785c-d128-4120-bb68-0c5ed5c8b429	\N	No, I haven't taken weight loss medications	No, I haven't taken weight loss medications	1	f1059dae-2daf-442b-ba86-e17917c4b43e	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
366abd0b-30dd-4c7f-b946-0bc018608ccd	\N	Yes, I have taken weight loss medications before.	Yes, I have taken weight loss medications before.	2	f1059dae-2daf-442b-ba86-e17917c4b43e	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
1684cc20-1a95-40a6-bca0-b200cac35201	\N	Semaglutide (Ozempic, Wegovy)	Semaglutide (Ozempic, Wegovy)	1	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
acd4c92f-4cbb-4545-bdc5-68656979c062	\N	Liraglutide (Saxenda, Victoza)	Liraglutide (Saxenda, Victoza)	2	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
0280713c-f383-49ff-b76b-33e7135902ca	\N	Tirzepatide (Mounjaro, Zepbound)	Tirzepatide (Mounjaro, Zepbound)	3	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
5fc6d013-3e3c-4aed-b9a4-e0266444cb4d	\N	Other weight loss medication	Other weight loss medication	4	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-18 02:44:25.791+00	2025-09-18 02:44:25.791+00
0f9b0bab-feb8-40c9-8b61-d27164b309c4	\N	Yes	Yes	1	1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	2025-09-19 04:46:07.288682+00	2025-09-19 04:46:07.288682+00
2c8fdcc8-4d0d-452f-bf92-d7f708f406f1	\N	No	No	2	1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	2025-09-19 04:46:20.885227+00	2025-09-19 04:46:20.885227+00
41593e20-beb7-43a4-864e-07f8237259b3	\N	Yes	Yes	1	b0fce918-96fb-4012-a1d1-9fe8fe81925f	2025-09-19 04:52:38.796735+00	2025-09-19 04:52:38.796735+00
7c4094e5-6cbb-41bf-8c3a-1e4fddfde314	\N	No	No	2	b0fce918-96fb-4012-a1d1-9fe8fe81925f	2025-09-19 04:52:38.796735+00	2025-09-19 04:52:38.796735+00
5bbf9bea-9159-4411-98d2-be4b50e16ba9	\N	Yes	Yes	1	93f87772-01fa-4864-a7c6-bf8efc8493f9	2025-09-19 05:02:29.13368+00	2025-09-19 05:02:29.13368+00
52e82037-7870-47a9-85ea-fb859124c279	\N	No	No	2	93f87772-01fa-4864-a7c6-bf8efc8493f9	2025-09-19 05:02:29.13368+00	2025-09-19 05:02:29.13368+00
306ff91f-49e0-40cd-924b-b02d403ab04f	\N	Yes	Yes	1	86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	2025-09-19 05:10:01.411803+00	2025-09-19 05:10:01.411803+00
48aff6c6-741a-415a-8a15-54d86192b4e8	\N	No	No	2	86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	2025-09-19 05:10:01.411803+00	2025-09-19 05:10:01.411803+00
\.


--
-- TOC entry 5794 (class 0 OID 24319)
-- Dependencies: 227
-- Data for Name: Questionnaire; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Questionnaire" (id, "deletedAt", title, description, "treatmentId", "createdAt", "updatedAt", "checkoutStepPosition") FROM stdin;
aa08a2d8-b298-434a-ad06-3ec7485fe50c	\N	NAD+ Intake Questionnaire	Complete intake questionnaire for NAD+ treatment	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:03:17.616+00	2025-09-13 01:03:17.616+00	0
c974ee9f-3e61-42b9-a0d2-08d1ca6e43f4	\N	Weight Loss Checkout	Select your weight loss plan and complete your order	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 03:23:32.268+00	2025-09-16 03:23:32.268+00	0
6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	\N	Weight Loss Assessment	Complete your personalized weight loss evaluation	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:18:06.611+00	2025-09-18 02:18:06.611+00	19
\.


--
-- TOC entry 5795 (class 0 OID 24331)
-- Dependencies: 228
-- Data for Name: QuestionnaireStep; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."QuestionnaireStep" (id, "deletedAt", title, description, "stepOrder", "questionnaireId", "createdAt", "updatedAt") FROM stdin;
122e2488-83ae-4cf7-98cf-27f15e48cf2b	\N	Welcome	We'll ask a few quick questions about your health, lifestyle, and goals. This helps your provider design the safest and most effective NAD+ plan for you.	1	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
16e9bb0d-91d1-4111-814b-6895a035d6f8	\N	Basics	Basic personal information	2	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	\N	Body Metrics	Height and weight information	3	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
ee5c1f70-eae6-4991-888b-6c0a99ba003e	\N	Medical Background	Medical history and current conditions	4	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
34643bfd-1617-487c-958f-25ff3607bc62	\N	Lifestyle & Habits	Lifestyle and daily habits	5	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
615e5d08-0e76-4efd-b7b6-6e879ac30358	\N	NAD+ Goals & Motivation	Your goals and motivations for NAD+ treatment	6	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
8e76b4dc-40fe-430c-911b-5c79541bd48b	\N	NAD+ Experience	Previous experience with NAD+	7	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
3203bc79-aa85-447f-982a-902416bbbce8	\N	Treatment Preferences	Your treatment preferences and expectations	8	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
ecabf119-f28e-470e-9042-f137a695df6b	\N	Final Step	Thanks for completing your NAD+ intake! Your information will be reviewed by your provider to create your personalized NAD+ plan.	9	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-13 01:03:17.623+00	2025-09-13 01:03:17.623+00
494573f0-07e4-41cd-96d6-216a8f15aadc	\N	Your Weight Loss Goals	What is your main goal with weight loss medication?	1	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
8a345b19-211e-49c5-9d81-b7b868f9c537	\N	Weight Loss History	Have you tried losing weight before?	2	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
f7f9d3d9-ea39-4103-9b10-644a41f84a1e	\N	Challenges You Face	What is the main difficulty you face when trying to lose weight?	3	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
9ca2b81c-06ab-4753-a588-3c98e1c460f8	\N	Treatment Information	83% of HeyFeels patients report that weight loss medication helps them achieve their goals more effectively.	4	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
fce69cde-4d4c-4465-a251-e929522ba024	\N	Location Verification	What state do you live in?	5	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
54f9762f-a900-4325-a04a-ab5afcec282d	\N	Personal Information	What's your gender at birth?	6	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
ecaa2116-ce93-4bb0-b869-c84f740bdffc	\N	Age Verification	What's your date of birth?	7	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
40eac62a-6faa-4aa0-87cf-5662f8ff6b49	\N	Create Your Account	We'll use this information to set up your personalized care plan	8	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
56bba504-0209-434e-906a-a0f48288568f	\N	Welcome!	We're excited to partner with you on your personalized weight loss journey.	9	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
3a3e0224-c757-4a81-96f8-7c4c25a88853	\N	Success Stories	Real customers who have achieved amazing results with HeyFeels	10	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
30c35e91-cdb7-488e-bee3-f25d753edd94	\N	Body Measurements	What is your current height and weight?	11	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
4479a22d-7b23-4937-bae3-2f0eff0dbdba	\N	Target Weight	What is your goal weight?	12	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
d12604a8-5711-4cf4-9946-617c4f12a97c	\N	Medical History - Specific	Do you have any of these medical conditions?	14	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
81c71333-a59c-4c63-b6cd-7159c636851d	\N	Allergies	Are you allergic to any of the following?	15	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
54c7c986-ca72-481a-b6f4-c0bc68b595bc	\N	Current Medications	Are you currently taking any medications?	16	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
29165ffd-1067-45a3-b5c9-28209e9865d2	\N	Diabetes Medications	Are you currently taking any of the following medications?	17	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
0cc47ef9-3c65-4165-8b2f-1557787a7f6f	\N	Weight Loss Medication History	Have you taken weight loss medications before?	18	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
1d168c52-b65e-4da2-88fe-a57a602d8337	\N	Recommended Treatment	Based on your assessment, our providers recommend this treatment	19	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
8e41a76d-cb19-4efd-af93-6b1a55242cc3	\N	Medical History - General	Do you have any of these medical conditions?	13	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-18 02:18:06.616+00	2025-09-18 02:18:06.616+00
\.


--
-- TOC entry 5784 (class 0 OID 16481)
-- Dependencies: 217
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."SequelizeMeta" (name) FROM stdin;
20250902021746-create_users_table.js
20250902023839-create_users_table_v2.js
20250902024735-add_hipaa_fields_to_users.js
20250904024937-create_session_table.js
20250904200249-add-address-fields-to-users.js
\.


--
-- TOC entry 5801 (class 0 OID 30814)
-- Dependencies: 234
-- Data for Name: ShippingAddress; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."ShippingAddress" (id, "deletedAt", address, apartment, city, state, "zipCode", country, "createdAt", "updatedAt", "userId", "isDefault") FROM stdin;
28ffb6ae-2b52-43d6-90ad-8b8244831350	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-20 05:41:16.748+00	2025-09-20 05:41:16.748+00	89b0ef70-7516-4fad-ac4a-37ac74815031	f
dc1053d7-0ca3-4c6d-8112-744694b84998	\N	66 Hansen Way	Apartment 4	Palo Alto	AZ	94304	us	2025-09-20 05:47:54.352+00	2025-09-20 05:47:54.352+00	2551f7cc-8c84-48da-bec3-fde2b39bc3cb	f
286c59e3-6e64-4acf-bdac-e71e045d54d5	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-23 01:47:19.589+00	2025-09-23 01:47:19.589+00	0007334a-e487-43a7-971b-5c4c8d2950fa	f
7a859b38-9664-41b1-860e-fc34e49a87b2	\N	Av. Bernardo Vieira de Melo 4250	Apt 801	Jaboatao dos Guararapes	CA	54420-010	us	2025-09-23 02:05:29.582+00	2025-09-23 02:05:29.582+00	8f59fb0a-ca8b-4e82-9104-eeea4e727f39	f
e817cd77-9886-4247-9b61-5336c5f7ff3d	\N	Hansen Way 64	801	Palo Alto	CA	94304	us	2025-09-23 02:10:55.515+00	2025-09-23 02:10:55.515+00	b89d92d0-dc03-487b-a246-a341ec5d1f37	f
b34d7a27-b518-4bcc-930d-7a6ebfbfe089	\N	Hansen Way 64	Apartment 4	Palo Alto	AL	94304	us	2025-09-23 02:14:19.727+00	2025-09-23 02:14:19.727+00	b89d92d0-dc03-487b-a246-a341ec5d1f37	f
e0805c5d-32e4-4f14-a635-918490036ead	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-23 02:34:08.321+00	2025-09-23 02:34:08.321+00	6b028641-7fb2-47bb-9fca-fedb3ea2ecd7	f
a2539844-289c-44bd-bf2a-76f8e42ce9e5	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-24 18:54:30.778+00	2025-09-24 18:54:30.778+00	3b2cadbc-829e-4efd-b0f4-0a4e97c73ebb	f
30cbc304-7ce4-42b4-8f8b-286cf8cba3b4	\N	66 Hansen Way	Apartment 4	Palo Alto	AK	94304	us	2025-09-24 20:37:16.325+00	2025-09-24 20:37:16.325+00	95214474-1920-4524-a513-2325edeb73dc	f
\.


--
-- TOC entry 5802 (class 0 OID 40951)
-- Dependencies: 235
-- Data for Name: ShippingOrder; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."ShippingOrder" (id, "deletedAt", "orderId", status, "pharmacyOrderId", "deliveredAt", "createdAt", "updatedAt", "shippingAddressId") FROM stdin;
\.


--
-- TOC entry 5803 (class 0 OID 40975)
-- Dependencies: 236
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Subscription" (id, "deletedAt", "clinicId", "orderId", status, "cancelledAt", "paymentDue", "stripeSubscriptionId", "paidAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5790 (class 0 OID 16739)
-- Dependencies: 223
-- Data for Name: Treatment; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Treatment" (id, "deletedAt", name, "userId", "createdAt", "updatedAt", "clinicId", "treatmentLogo", price, "productsPrice", active, "stripeProductId", "stripePriceId") FROM stdin;
0bc5e6fa-360f-412c-8d11-34910ee05fe0	\N	Anti Aging Glutathione	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-12 20:35:24.404+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757709322973-bird.jpg	0	0	f	\N	\N
724eb0c4-54a3-447c-8814-de4c1060e77a	\N	Anti Aging NAD+	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-25 03:11:23.862+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757708989911-flower.jpg	0	1478.4	f	\N	\N
ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	Weight Loss	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-16 02:47:36.817+00	2025-09-25 03:11:23.863+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757997453304-weight-loss.jpg	0	4950	f	\N	\N
b689451f-db88-4c98-900e-df3dbcfebe2a	\N	Weight Loss 2	31ca4227-94d1-43bf-990a-43a14b938609	2025-09-18 02:15:08.309+00	2025-09-25 03:11:23.863+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758169025047-pexels-pixabay-53404.jpg	0	1042.8	f	prod_T5LaIujOqlryWl	price_1S9At5ELzhgYQXTRTdDukIMJ
44085547-afc4-4722-adf1-6722b4d4e0e9	\N	Energy Enhancement	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-25 03:30:11.152+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758771009851-desert.jpg	0	0	f	\N	\N
1e9d248d-5ff8-47b8-86a8-65200aa04b39	\N	Immune Support	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-25 03:31:25.137+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758771083826-dolphin.jpg	0	0	f	\N	\N
\.


--
-- TOC entry 5804 (class 0 OID 50757)
-- Dependencies: 237
-- Data for Name: TreatmentPlan; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."TreatmentPlan" (id, "deletedAt", name, description, "billingInterval", "stripePriceId", price, active, popular, "sortOrder", "treatmentId", "createdAt", "updatedAt") FROM stdin;
00e000db-2f7b-405f-85a1-d72148dda001	\N	Biannual Plan	Billed every six months\n	biannual	price_1S9IbLELzhgYQXTRdQ0usXlR	249	t	f	3	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-20 02:13:06.359469+00	2025-09-20 02:13:06.359469+00
d975cc52-4628-4981-bcde-de741823fce8	\N	Quarterly Plan	Billed every 3 months	quarterly	price_1S9IauELzhgYQXTR8omAvXR9	269	t	f	2	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-20 02:13:06.359469+00	2025-09-20 02:13:06.359469+00
96158ea4-d760-47f0-9b45-f119ffe7d23f	\N	Monthly Plan	Billed monthly	monthly	price_1S9IaGELzhgYQXTR0oOellfG	199	t	t	1	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-20 02:13:06.359469+00	2025-09-20 02:13:06.359469+00
\.


--
-- TOC entry 5792 (class 0 OID 16766)
-- Dependencies: 225
-- Data for Name: TreatmentProducts; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."TreatmentProducts" (id, "deletedAt", dosage, "productId", "treatmentId", "createdAt", "updatedAt") FROM stdin;
660e8400-e29b-41d4-a716-446655440001	\N	500 mg per infusion	550e8400-e29b-41d4-a716-446655440001	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440002	\N	300 mg daily	550e8400-e29b-41d4-a716-446655440002	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440003	\N	750 mg NAD+ + B-complex per infusion	550e8400-e29b-41d4-a716-446655440003	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440004	\N	500 mg NAD+ + 2000 mg Glutathione per infusion	550e8400-e29b-41d4-a716-446655440004	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440005	\N	50 mg per spray, 2 sprays daily	550e8400-e29b-41d4-a716-446655440005	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440101	\N	0.25–2 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440101	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440102	\N	2.4 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440102	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440103	\N	2.5–15 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440103	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440104	\N	3 mg subcutaneous injection daily	550e8400-e29b-41d4-a716-446655440104	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440105	\N	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	550e8400-e29b-41d4-a716-446655440105	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440201	\N	0.25–2 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440201	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:36:49.931+00	2025-09-18 02:36:49.931+00
660e8400-e29b-41d4-a716-446655440202	\N	2.5–15 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440202	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:36:49.931+00	2025-09-18 02:36:49.931+00
660e8400-e29b-41d4-a716-446655440203	\N	3 mg subcutaneous injection daily	550e8400-e29b-41d4-a716-446655440203	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:36:49.931+00	2025-09-18 02:36:49.931+00
\.


--
-- TOC entry 5785 (class 0 OID 16506)
-- Dependencies: 218
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 5786 (class 0 OID 16707)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public.users (id, "deletedAt", "firstName", "lastName", email, "passwordHash", dob, "phoneNumber", address, city, state, "zipCode", role, "lastLoginAt", "consentGivenAt", "emergencyContact", "createdAt", "updatedAt", "clinicId", "pharmacyPatientId", gender, allergies, diseases, medications, "stripeCustomerId", activated, "activationToken", "activationTokenExpiresAt") FROM stdin;
f67562fc-11b9-4974-976a-61efe592d291	\N	Kale	Smith	iateyourkalechip@gmail.com	$2b$12$rlQlc////tVhfa6NrPTZX.yoZyu5vOVFNeUwKqbrb3L6pz4oWoQZC	2003-09-21	7062371480	\N	\N	\N	\N	patient	2025-09-22 03:40:35.481+00	2025-09-15 23:08:36.357+00	\N	2025-09-15 23:08:36.359+00	2025-09-22 03:40:35.481+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	f	\N	\N
0007334a-e487-43a7-971b-5c4c8d2950fa	\N	John	Cena11	john.cena11@gmail.com	$2b$12$zko0KfApN7Y1C6zpKiuV0uJU8ZZNQVtT6EoSlksROV5Ly9wKxwhZ.	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-23 01:47:17.455+00	\N	2025-09-23 01:47:17.456+00	2025-09-23 01:47:19.406+00	\N	\N	\N	\N	\N	\N	cus_T6YQo4ZAUNW7MY	f	\N	\N
8f59fb0a-ca8b-4e82-9104-eeea4e727f39	\N	John	Cena12	john.cena12@gmail.com	$2b$12$t.a0LIwOBnJarmRsnSN6CeRV2S8YX8UojB3/E/wryFWeW8T68fa4a	\N	34135135135	\N	\N	\N	\N	patient	\N	2025-09-23 02:05:27.45+00	\N	2025-09-23 02:05:27.451+00	2025-09-23 02:05:29.385+00	\N	\N	\N	\N	\N	\N	cus_T6YjqcBuAqVGg5	f	\N	\N
b89d92d0-dc03-487b-a246-a341ec5d1f37	\N	John	Cena13	john.cena13@gmail.com	$2b$12$390DnW4PXkz0kvke09TEA.ie8o7vGVIaGdYqwheX8ZzBr80AiRUUa	\N	31413513513	\N	\N	\N	\N	patient	\N	2025-09-23 02:10:53.523+00	\N	2025-09-23 02:10:53.524+00	2025-09-23 02:10:55.331+00	\N	\N	\N	\N	\N	\N	cus_T6YoiuFwLv0T1p	f	\N	\N
6b028641-7fb2-47bb-9fca-fedb3ea2ecd7	\N	John	Cena14	john.cena14@gmail.com	$2b$12$77BO4ybd3OKkpOM9sGGESOcQw91GjvzndnoytCycpxoS1GFbtCgTu	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-23 02:34:07.969+00	\N	2025-09-23 02:34:07.97+00	2025-09-23 02:34:08.317+00	\N	\N	\N	\N	\N	\N	cus_T6ZBZfsFeeCmrX	f	\N	\N
4b4274d0-11df-4c69-8e94-915ab68a45d2	\N	Test	User	test@example.com	$2b$12$d7XWj1ZA7ns52sLMQ.aZX.GyKkJPh/NZX7uSTU3mmzBLngk1LEOBG	\N	\N	\N	\N	\N	\N	patient	\N	2025-09-23 20:04:55.577+00	\N	2025-09-23 20:04:55.578+00	2025-09-23 20:04:55.578+00	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
2fcba317-1998-4045-8ec9-02a870d20d58	\N	John	Oaks	johnoaks@gmail.com	$2b$12$eNn.YdOnYOC/AKtye8/b8O5ZFIvHJGCKjE31vFDlc87uX2qS0uynC	\N	\N	\N	\N	\N	\N	admin	\N	2025-09-23 20:15:19.907+00	\N	2025-09-23 20:15:19.909+00	2025-09-23 20:15:19.909+00	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
1756cddf-0944-4546-8696-f482ce63ef12	\N	Brand	Test	brand@test.com	$2b$12$Z8fVLdqV/tljalB0WHpSa.HvDnJbUTsG9yDtkvF7Lg/j2ZlpPxKiG	\N	\N	\N	\N	\N	\N	brand	\N	2025-09-23 20:16:49.029+00	\N	2025-09-23 20:16:49.029+00	2025-09-23 20:16:49.029+00	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	\N	Guilherme	Marques	grrbm3@gmail.com	$2b$12$8sL.TmbXqyQCzs1i9vZwh.wOSMMs53I2A0GIEqls9jmddcs8.hX9e	1988-07-14	5551234567	\N	\N	\N	\N	doctor	2025-09-18 04:16:02.422+00	2025-09-12 03:04:52.884+00	\N	2025-09-12 03:04:52.886+00	2025-09-18 04:16:02.422+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	f	\N	\N
31ca4227-94d1-43bf-990a-43a14b938609	\N	Daniel	Meursing	dmeursing@yahoo.com	$2b$12$Xwqfbpp7iH0ZD.A5kNteEePRr1.U1KnYF6LOzwOaWk/.he2e0WClC	1995-06-06	9095328622	\N	\N	\N	\N	doctor	2025-09-16 21:17:27.571+00	2025-09-16 04:11:02.5+00	\N	2025-09-16 04:11:02.501+00	2025-09-16 21:17:27.571+00	29e3985c-20cd-45a8-adf7-d6f4cdd21a15	\N	\N	\N	\N	\N	\N	f	\N	\N
63ab9a4a-ddd0-492b-9912-c7a731df19f4	\N	Agora	Vai	agoravaiguilherme@gmail.com	$2b$12$/x.Rp6e7Xblil7Hm1UEisuL/qx6gR0E0/OfG9ZLJ.JhfJBPGmeyf.	1988-07-14	5551234567	\N	\N	\N	\N	patient	2025-09-20 02:54:06.527+00	2025-09-12 03:07:17.457+00	\N	2025-09-12 03:07:17.458+00	2025-09-20 02:54:06.528+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	cus_T5LfsXy7oOQSUZ	f	\N	\N
9bc80814-7c2d-4624-9000-72b38a03c6fd	\N	John	Cena	john.cena@gmail.com	$2b$12$456.6LoC2S2zXq2lsWDZFeBWRioa2fmWE1rJGStfc5SJUdnxDgng2	\N	13135135135	\N	\N	\N	\N	patient	\N	2025-09-20 03:58:56.799+00	\N	2025-09-20 03:58:56.8+00	2025-09-20 03:58:58.23+00	\N	\N	\N	\N	\N	\N	cus_T5Ss327UdFeSvZ	f	\N	\N
75fa14f5-b923-436d-aae7-436b3055375e	\N	John	Doe	johndoe@gmail.com	$2b$12$STt8R889RvEuxg9sj9eBKunlX/fRXlUGKK6tT5y97lOhjKBaEi0R.	\N	13413135135	\N	\N	\N	\N	patient	\N	2025-09-20 04:10:32.409+00	\N	2025-09-20 04:10:32.409+00	2025-09-20 04:10:34.046+00	\N	\N	\N	\N	\N	\N	cus_T5T4IzWJAhqAJY	f	\N	\N
3b2cadbc-829e-4efd-b0f4-0a4e97c73ebb	\N	John	Cena15	john.cena15@gmail.com	$2b$12$cuJ1VWFC24NLjb2b.O7eRuufggoQZKMNOnLypBpWt.62DyjuFFFCi	\N	31135135	\N	\N	\N	\N	patient	\N	2025-09-24 18:54:28.707+00	\N	2025-09-24 18:54:28.708+00	2025-09-24 18:54:30.584+00	\N	\N	\N	\N	\N	\N	cus_T7CEbkxhppDxPZ	f	\N	\N
2b6a9d71-a7be-4216-8d3e-c23aeb1ef9e4	\N	John	Cena2	john.cena2@gmail.com	$2b$12$1uMdKfR2Hak6rDrq.lzExOq/7GA4gr8DVYuC0Shy37vUjYYwrle0u	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-20 04:47:56.533+00	\N	2025-09-20 04:47:56.534+00	2025-09-20 04:47:58.169+00	\N	\N	\N	\N	\N	\N	cus_T5TfFtS39RhtWR	f	\N	\N
036a4efd-f65a-47f5-958e-04d3cdbee596	\N	John	Cena3	john.cena3@gmail.com	$2b$12$LMQvjUELQrnAVqAByioMn.cO5WGEbemsBNvpCknq6FIW93ZXN1skW	\N	134135135135	\N	\N	\N	\N	patient	\N	2025-09-20 04:53:12.806+00	\N	2025-09-20 04:53:12.807+00	2025-09-20 04:53:14.492+00	\N	\N	\N	\N	\N	\N	cus_T5TkR6RVhzCyMq	f	\N	\N
15d13138-9f32-4358-92d8-600d9c6fe558	\N	John	Cena4	john.cena4@gmail.com	$2b$12$L05HYgyJjDrJNpM2HLqar.6vs12J28GRQXmyVzdh.uFkQkqI2dNwG	\N	134135135135	\N	\N	\N	\N	patient	\N	2025-09-20 05:00:44.142+00	\N	2025-09-20 05:00:44.142+00	2025-09-20 05:00:45.775+00	\N	\N	\N	\N	\N	\N	cus_T5TsPd4vX3amWZ	f	\N	\N
df8f4c32-b6ba-4efd-af34-afcc6272a945	\N	John	Cena5	john.cena5@gmail.com	$2b$12$DOi0Rmjszucztj1aiXX6U.SoS3TZL6/Ku19mcZFj/5IL1oyMtFy/C	\N	13513513513	\N	\N	\N	\N	patient	\N	2025-09-20 05:04:14.17+00	\N	2025-09-20 05:04:14.171+00	2025-09-20 05:04:15.758+00	\N	\N	\N	\N	\N	\N	cus_T5TvGppSDIME0Y	f	\N	\N
89b0ef70-7516-4fad-ac4a-37ac74815031	\N	John	Cena8	john.cena8@gmail.com	$2b$12$1ZIDVovRMwBgCASQggfZ6.8hZTPOWnxv1msUoiIOY3ZHcTaMyKzzK	\N	314135135	\N	\N	\N	\N	patient	\N	2025-09-20 05:41:14.576+00	\N	2025-09-20 05:41:14.578+00	2025-09-20 05:41:16.374+00	\N	\N	\N	\N	\N	\N	cus_T5UWNn15jV8GHL	f	\N	\N
2551f7cc-8c84-48da-bec3-fde2b39bc3cb	\N	John	Cena9	john.cena9@gmail.com	$2b$12$4GxyexbzBohDjSLoop5YNOaz9qZLXPtVV.fUCIWo/vzdFDcDB96BC	\N	2133134444	\N	\N	\N	\N	patient	\N	2025-09-20 05:47:54.009+00	\N	2025-09-20 05:47:54.01+00	2025-09-20 05:47:54.34+00	\N	\N	\N	\N	\N	\N	cus_T5UdQ9rWhITKky	f	\N	\N
95214474-1920-4524-a513-2325edeb73dc	\N	John	Cena20	john.cena20@gmail.com	$2b$12$H.QzODQWEv3GmlW2Ntcoh.af7Cg5uOLZRtNGbQnMJOwHvopg2b9mi	\N	31413513	\N	\N	\N	\N	patient	\N	2025-09-24 20:37:14.136+00	\N	2025-09-24 20:37:14.137+00	2025-09-24 20:37:16.137+00	\N	\N	\N	\N	\N	\N	cus_T7Dsiewt6c6L0N	f	\N	\N
2d9fa149-b808-4e9e-92a1-023b7ae673fd	\N	Guilherme	Reis	grrbm4@gmail.com	$2b$12$1cGbphDE9ySZ.tfH.7yBHum58Lb4Sklx7yyfbsW5nPS.CLtfzugaG	\N	135135135	\N	\N	\N	\N	brand	\N	2025-09-24 01:30:57.654+00	\N	2025-09-24 01:30:57.656+00	2025-09-24 01:30:57.887+00	\N	\N	\N	\N	\N	\N	\N	f	d88cfb09fd7d0626f34b5330e93d695601d65ccfc43b1479e291b3862a31aa42	2025-09-25 01:30:57.886+00
15f6c10e-69a7-449a-99be-19e84e8aa0ce	\N	Test2	User2	test2@example.com	$2b$12$ZibO9SlRpS.bbfvGMtetAe.uPqaQdCcUraDgg4lUWdxZOG8lGZssm	\N	123-456-7890	\N	\N	\N	\N	brand	\N	2025-09-25 18:01:27.22+00	\N	2025-09-25 18:01:27.22+00	2025-09-25 18:01:27.608+00	6cef6794-7acb-4529-bb41-cef46849120b	\N	\N	\N	\N	\N	\N	f	835ec90cd021f7d5c96538f1747ef59ff5f458c855fc207b73021ee7ecdfd288	2025-09-26 18:01:27.606+00
047ff79b-acfc-4513-8afc-5013797d113c	\N	Guilherme	Reis	grrbm5@gmail.com	$2b$12$Y4jF0wGqdnmYFHK8HOUatO40ETp8jPhlJwyQ4hQHGo1zaE6bOZj6O	\N	135135135	\N	\N	\N	\N	brand	\N	2025-09-24 01:36:37.192+00	\N	2025-09-24 01:36:37.193+00	2025-09-24 01:39:38.16+00	\N	\N	\N	\N	\N	\N	\N	t	28bfe059038dadbc38c6d3d2d503b5f3de5b21e37aacbb229a75a785ac3ef373	2025-09-25 01:36:37.421+00
1f8acc57-f137-4b51-ad44-cad317ba43cf	\N	Guilherme	Reis	grrbm2@gmail.com	$2b$12$APeX9mdS5Zd8io38i6GUzOkmO5agEJzRXy7VMWKG/5f0QuuH1k60S	\N	135135135135	\N	\N	\N	\N	brand	2025-09-25 20:21:54.314+00	2025-09-24 02:30:19.525+00	\N	2025-09-24 02:30:19.526+00	2025-09-25 20:21:54.315+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	t	8b41b26b7b72a0164170fd36ff281e485fa07523c985c79ac3624a0451333b01	2025-09-25 02:30:19.541+00
cea7b7d4-63eb-4d48-8e4e-80da1fe6b530	\N	john	brand	johnbrand@gmail.com	$2b$12$o0eh.mZQT74yc15RGj3Yk.wDT1BcLIA7gqU3UfUCFQap.GfgZixVW	\N	+55135135135	\N	\N	\N	\N	brand	\N	2025-09-25 18:10:42.053+00	\N	2025-09-25 18:10:42.054+00	2025-09-25 18:10:42.436+00	c7d2c458-d3e4-41e1-b620-f05c338e7efc	\N	\N	\N	\N	\N	\N	f	63040e5edf4ae71204b61366b57dc8e5056b7b4196a462bfd8b4aa86a130f9f2	2025-09-26 18:10:42.434+00
643d787f-4304-445d-b974-1ba4fa0b2e70	\N	Daniel	Meursing	dkmeursing@gmail.com	$2b$12$WtcurGvZIQMXN4Gx5V7/s.Xx6DJja8T8YtqS6WX0Q57QAB5z2SflS	\N	9095321861	\N	\N	\N	\N	brand	2025-09-25 04:58:03.525+00	2025-09-24 05:25:19.148+00	\N	2025-09-24 05:25:19.148+00	2025-09-25 04:58:03.525+00	\N	\N	\N	\N	\N	\N	\N	t	2d86fab8552f55f051546495d541a21ba4329675daae5fdf572fa162d57a5b97	2025-09-25 05:25:19.185+00
01d77389-3414-48df-b39a-e0dfcfdff359	\N	smeagol	smeagol	smeagol@gmail.com	$2b$12$lOEcZ3c.JclANvBD1TU/l.SQMJccI9C7DLdO1eoHEZdfUAHY5RktK	\N	135135135	\N	\N	\N	\N	brand	\N	2025-09-25 20:22:51.505+00	\N	2025-09-25 20:22:51.506+00	2025-09-25 20:22:51.701+00	\N	\N	\N	\N	\N	\N	\N	f	023fa5c31b7e505eecd00d23994eab076b3bb7a5466e7be0af33c39a27cc3939	2025-09-26 20:22:51.7+00
\.


--
-- TOC entry 5601 (class 2606 OID 111421)
-- Name: BrandSubscriptionPlans BrandSubscriptionPlans_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscriptionPlans"
    ADD CONSTRAINT "BrandSubscriptionPlans_pkey" PRIMARY KEY (id);


--
-- TOC entry 5585 (class 2606 OID 111289)
-- Name: BrandSubscription BrandSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_pkey" PRIMARY KEY (id);


--
-- TOC entry 5587 (class 2606 OID 125337)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5589 (class 2606 OID 125339)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key1" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5591 (class 2606 OID 125341)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key2" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5593 (class 2606 OID 125335)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key3" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5595 (class 2606 OID 125333)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key4" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5597 (class 2606 OID 125343)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key5" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5599 (class 2606 OID 125345)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key6" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 4719 (class 2606 OID 16868)
-- Name: Clinic Clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_pkey" PRIMARY KEY (id);


--
-- TOC entry 4721 (class 2606 OID 126762)
-- Name: Clinic Clinic_slug_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key" UNIQUE (slug);


--
-- TOC entry 4723 (class 2606 OID 126760)
-- Name: Clinic Clinic_slug_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key1" UNIQUE (slug);


--
-- TOC entry 4725 (class 2606 OID 126914)
-- Name: Clinic Clinic_slug_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key10" UNIQUE (slug);


--
-- TOC entry 4727 (class 2606 OID 126962)
-- Name: Clinic Clinic_slug_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key100" UNIQUE (slug);


--
-- TOC entry 4729 (class 2606 OID 126956)
-- Name: Clinic Clinic_slug_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key101" UNIQUE (slug);


--
-- TOC entry 4731 (class 2606 OID 126954)
-- Name: Clinic Clinic_slug_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key102" UNIQUE (slug);


--
-- TOC entry 4733 (class 2606 OID 126950)
-- Name: Clinic Clinic_slug_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key103" UNIQUE (slug);


--
-- TOC entry 4735 (class 2606 OID 126948)
-- Name: Clinic Clinic_slug_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key104" UNIQUE (slug);


--
-- TOC entry 4737 (class 2606 OID 126946)
-- Name: Clinic Clinic_slug_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key105" UNIQUE (slug);


--
-- TOC entry 4739 (class 2606 OID 126958)
-- Name: Clinic Clinic_slug_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key106" UNIQUE (slug);


--
-- TOC entry 4741 (class 2606 OID 126850)
-- Name: Clinic Clinic_slug_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key107" UNIQUE (slug);


--
-- TOC entry 4743 (class 2606 OID 126944)
-- Name: Clinic Clinic_slug_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key108" UNIQUE (slug);


--
-- TOC entry 4745 (class 2606 OID 126942)
-- Name: Clinic Clinic_slug_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key109" UNIQUE (slug);


--
-- TOC entry 4747 (class 2606 OID 126804)
-- Name: Clinic Clinic_slug_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key11" UNIQUE (slug);


--
-- TOC entry 4749 (class 2606 OID 126616)
-- Name: Clinic Clinic_slug_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key110" UNIQUE (slug);


--
-- TOC entry 4751 (class 2606 OID 126940)
-- Name: Clinic Clinic_slug_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key111" UNIQUE (slug);


--
-- TOC entry 4753 (class 2606 OID 126934)
-- Name: Clinic Clinic_slug_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key112" UNIQUE (slug);


--
-- TOC entry 4755 (class 2606 OID 126952)
-- Name: Clinic Clinic_slug_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key113" UNIQUE (slug);


--
-- TOC entry 4757 (class 2606 OID 126932)
-- Name: Clinic Clinic_slug_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key114" UNIQUE (slug);


--
-- TOC entry 4759 (class 2606 OID 126930)
-- Name: Clinic Clinic_slug_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key115" UNIQUE (slug);


--
-- TOC entry 4761 (class 2606 OID 126926)
-- Name: Clinic Clinic_slug_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key116" UNIQUE (slug);


--
-- TOC entry 4763 (class 2606 OID 126696)
-- Name: Clinic Clinic_slug_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key117" UNIQUE (slug);


--
-- TOC entry 4765 (class 2606 OID 126922)
-- Name: Clinic Clinic_slug_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key118" UNIQUE (slug);


--
-- TOC entry 4767 (class 2606 OID 126920)
-- Name: Clinic Clinic_slug_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key119" UNIQUE (slug);


--
-- TOC entry 4769 (class 2606 OID 126806)
-- Name: Clinic Clinic_slug_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key12" UNIQUE (slug);


--
-- TOC entry 4771 (class 2606 OID 126698)
-- Name: Clinic Clinic_slug_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key120" UNIQUE (slug);


--
-- TOC entry 4773 (class 2606 OID 126918)
-- Name: Clinic Clinic_slug_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key121" UNIQUE (slug);


--
-- TOC entry 4775 (class 2606 OID 126700)
-- Name: Clinic Clinic_slug_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key122" UNIQUE (slug);


--
-- TOC entry 4777 (class 2606 OID 126916)
-- Name: Clinic Clinic_slug_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key123" UNIQUE (slug);


--
-- TOC entry 4779 (class 2606 OID 126776)
-- Name: Clinic Clinic_slug_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key124" UNIQUE (slug);


--
-- TOC entry 4781 (class 2606 OID 126774)
-- Name: Clinic Clinic_slug_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key125" UNIQUE (slug);


--
-- TOC entry 4783 (class 2606 OID 126924)
-- Name: Clinic Clinic_slug_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key126" UNIQUE (slug);


--
-- TOC entry 4785 (class 2606 OID 126928)
-- Name: Clinic Clinic_slug_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key127" UNIQUE (slug);


--
-- TOC entry 4787 (class 2606 OID 126772)
-- Name: Clinic Clinic_slug_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key128" UNIQUE (slug);


--
-- TOC entry 4789 (class 2606 OID 126912)
-- Name: Clinic Clinic_slug_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key129" UNIQUE (slug);


--
-- TOC entry 4791 (class 2606 OID 126640)
-- Name: Clinic Clinic_slug_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key13" UNIQUE (slug);


--
-- TOC entry 4793 (class 2606 OID 126748)
-- Name: Clinic Clinic_slug_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key130" UNIQUE (slug);


--
-- TOC entry 4795 (class 2606 OID 126752)
-- Name: Clinic Clinic_slug_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key131" UNIQUE (slug);


--
-- TOC entry 4797 (class 2606 OID 126746)
-- Name: Clinic Clinic_slug_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key132" UNIQUE (slug);


--
-- TOC entry 4799 (class 2606 OID 126938)
-- Name: Clinic Clinic_slug_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key133" UNIQUE (slug);


--
-- TOC entry 4801 (class 2606 OID 126744)
-- Name: Clinic Clinic_slug_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key134" UNIQUE (slug);


--
-- TOC entry 4803 (class 2606 OID 126742)
-- Name: Clinic Clinic_slug_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key135" UNIQUE (slug);


--
-- TOC entry 4805 (class 2606 OID 126738)
-- Name: Clinic Clinic_slug_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key136" UNIQUE (slug);


--
-- TOC entry 4807 (class 2606 OID 126960)
-- Name: Clinic Clinic_slug_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key137" UNIQUE (slug);


--
-- TOC entry 4809 (class 2606 OID 126736)
-- Name: Clinic Clinic_slug_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key138" UNIQUE (slug);


--
-- TOC entry 4811 (class 2606 OID 126870)
-- Name: Clinic Clinic_slug_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key139" UNIQUE (slug);


--
-- TOC entry 4813 (class 2606 OID 126984)
-- Name: Clinic Clinic_slug_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key14" UNIQUE (slug);


--
-- TOC entry 4815 (class 2606 OID 126734)
-- Name: Clinic Clinic_slug_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key140" UNIQUE (slug);


--
-- TOC entry 4817 (class 2606 OID 126740)
-- Name: Clinic Clinic_slug_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key141" UNIQUE (slug);


--
-- TOC entry 4819 (class 2606 OID 126732)
-- Name: Clinic Clinic_slug_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key142" UNIQUE (slug);


--
-- TOC entry 4821 (class 2606 OID 126730)
-- Name: Clinic Clinic_slug_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key143" UNIQUE (slug);


--
-- TOC entry 4823 (class 2606 OID 126702)
-- Name: Clinic Clinic_slug_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key144" UNIQUE (slug);


--
-- TOC entry 4825 (class 2606 OID 126728)
-- Name: Clinic Clinic_slug_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key145" UNIQUE (slug);


--
-- TOC entry 4827 (class 2606 OID 126704)
-- Name: Clinic Clinic_slug_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key146" UNIQUE (slug);


--
-- TOC entry 4829 (class 2606 OID 126726)
-- Name: Clinic Clinic_slug_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key147" UNIQUE (slug);


--
-- TOC entry 4831 (class 2606 OID 126706)
-- Name: Clinic Clinic_slug_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key148" UNIQUE (slug);


--
-- TOC entry 4833 (class 2606 OID 126832)
-- Name: Clinic Clinic_slug_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key149" UNIQUE (slug);


--
-- TOC entry 4835 (class 2606 OID 126638)
-- Name: Clinic Clinic_slug_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key15" UNIQUE (slug);


--
-- TOC entry 4837 (class 2606 OID 126722)
-- Name: Clinic Clinic_slug_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key150" UNIQUE (slug);


--
-- TOC entry 4839 (class 2606 OID 126724)
-- Name: Clinic Clinic_slug_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key151" UNIQUE (slug);


--
-- TOC entry 4841 (class 2606 OID 126648)
-- Name: Clinic Clinic_slug_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key152" UNIQUE (slug);


--
-- TOC entry 4843 (class 2606 OID 126714)
-- Name: Clinic Clinic_slug_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key153" UNIQUE (slug);


--
-- TOC entry 4845 (class 2606 OID 126708)
-- Name: Clinic Clinic_slug_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key154" UNIQUE (slug);


--
-- TOC entry 4847 (class 2606 OID 126650)
-- Name: Clinic Clinic_slug_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key155" UNIQUE (slug);


--
-- TOC entry 4849 (class 2606 OID 126764)
-- Name: Clinic Clinic_slug_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key156" UNIQUE (slug);


--
-- TOC entry 4851 (class 2606 OID 126890)
-- Name: Clinic Clinic_slug_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key157" UNIQUE (slug);


--
-- TOC entry 4853 (class 2606 OID 126888)
-- Name: Clinic Clinic_slug_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key158" UNIQUE (slug);


--
-- TOC entry 4855 (class 2606 OID 126652)
-- Name: Clinic Clinic_slug_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key159" UNIQUE (slug);


--
-- TOC entry 4857 (class 2606 OID 126986)
-- Name: Clinic Clinic_slug_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key16" UNIQUE (slug);


--
-- TOC entry 4859 (class 2606 OID 126886)
-- Name: Clinic Clinic_slug_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key160" UNIQUE (slug);


--
-- TOC entry 4861 (class 2606 OID 126654)
-- Name: Clinic Clinic_slug_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key161" UNIQUE (slug);


--
-- TOC entry 4863 (class 2606 OID 126792)
-- Name: Clinic Clinic_slug_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key162" UNIQUE (slug);


--
-- TOC entry 4865 (class 2606 OID 126656)
-- Name: Clinic Clinic_slug_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key163" UNIQUE (slug);


--
-- TOC entry 4867 (class 2606 OID 126790)
-- Name: Clinic Clinic_slug_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key164" UNIQUE (slug);


--
-- TOC entry 4869 (class 2606 OID 126788)
-- Name: Clinic Clinic_slug_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key165" UNIQUE (slug);


--
-- TOC entry 4871 (class 2606 OID 126658)
-- Name: Clinic Clinic_slug_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key166" UNIQUE (slug);


--
-- TOC entry 4873 (class 2606 OID 126786)
-- Name: Clinic Clinic_slug_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key167" UNIQUE (slug);


--
-- TOC entry 4875 (class 2606 OID 126784)
-- Name: Clinic Clinic_slug_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key168" UNIQUE (slug);


--
-- TOC entry 4877 (class 2606 OID 126660)
-- Name: Clinic Clinic_slug_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key169" UNIQUE (slug);


--
-- TOC entry 4879 (class 2606 OID 126636)
-- Name: Clinic Clinic_slug_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key17" UNIQUE (slug);


--
-- TOC entry 4881 (class 2606 OID 126782)
-- Name: Clinic Clinic_slug_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key170" UNIQUE (slug);


--
-- TOC entry 4883 (class 2606 OID 126780)
-- Name: Clinic Clinic_slug_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key171" UNIQUE (slug);


--
-- TOC entry 4885 (class 2606 OID 126778)
-- Name: Clinic Clinic_slug_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key172" UNIQUE (slug);


--
-- TOC entry 4887 (class 2606 OID 126662)
-- Name: Clinic Clinic_slug_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key173" UNIQUE (slug);


--
-- TOC entry 4889 (class 2606 OID 126884)
-- Name: Clinic Clinic_slug_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key174" UNIQUE (slug);


--
-- TOC entry 4891 (class 2606 OID 126664)
-- Name: Clinic Clinic_slug_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key175" UNIQUE (slug);


--
-- TOC entry 4893 (class 2606 OID 126882)
-- Name: Clinic Clinic_slug_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key176" UNIQUE (slug);


--
-- TOC entry 4895 (class 2606 OID 126666)
-- Name: Clinic Clinic_slug_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key177" UNIQUE (slug);


--
-- TOC entry 4897 (class 2606 OID 126880)
-- Name: Clinic Clinic_slug_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key178" UNIQUE (slug);


--
-- TOC entry 4899 (class 2606 OID 126668)
-- Name: Clinic Clinic_slug_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key179" UNIQUE (slug);


--
-- TOC entry 4901 (class 2606 OID 126988)
-- Name: Clinic Clinic_slug_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key18" UNIQUE (slug);


--
-- TOC entry 4903 (class 2606 OID 126878)
-- Name: Clinic Clinic_slug_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key180" UNIQUE (slug);


--
-- TOC entry 4905 (class 2606 OID 126876)
-- Name: Clinic Clinic_slug_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key181" UNIQUE (slug);


--
-- TOC entry 4907 (class 2606 OID 126670)
-- Name: Clinic Clinic_slug_key182; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key182" UNIQUE (slug);


--
-- TOC entry 4909 (class 2606 OID 126802)
-- Name: Clinic Clinic_slug_key183; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key183" UNIQUE (slug);


--
-- TOC entry 4911 (class 2606 OID 126800)
-- Name: Clinic Clinic_slug_key184; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key184" UNIQUE (slug);


--
-- TOC entry 4913 (class 2606 OID 126936)
-- Name: Clinic Clinic_slug_key185; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key185" UNIQUE (slug);


--
-- TOC entry 4915 (class 2606 OID 126798)
-- Name: Clinic Clinic_slug_key186; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key186" UNIQUE (slug);


--
-- TOC entry 4917 (class 2606 OID 126796)
-- Name: Clinic Clinic_slug_key187; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key187" UNIQUE (slug);


--
-- TOC entry 4919 (class 2606 OID 126794)
-- Name: Clinic Clinic_slug_key188; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key188" UNIQUE (slug);


--
-- TOC entry 4921 (class 2606 OID 126808)
-- Name: Clinic Clinic_slug_key189; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key189" UNIQUE (slug);


--
-- TOC entry 4923 (class 2606 OID 126634)
-- Name: Clinic Clinic_slug_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key19" UNIQUE (slug);


--
-- TOC entry 4925 (class 2606 OID 126672)
-- Name: Clinic Clinic_slug_key190; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key190" UNIQUE (slug);


--
-- TOC entry 4927 (class 2606 OID 126674)
-- Name: Clinic Clinic_slug_key191; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key191" UNIQUE (slug);


--
-- TOC entry 4929 (class 2606 OID 126676)
-- Name: Clinic Clinic_slug_key192; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key192" UNIQUE (slug);


--
-- TOC entry 4931 (class 2606 OID 126694)
-- Name: Clinic Clinic_slug_key193; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key193" UNIQUE (slug);


--
-- TOC entry 4933 (class 2606 OID 126678)
-- Name: Clinic Clinic_slug_key194; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key194" UNIQUE (slug);


--
-- TOC entry 4935 (class 2606 OID 126692)
-- Name: Clinic Clinic_slug_key195; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key195" UNIQUE (slug);


--
-- TOC entry 4937 (class 2606 OID 126680)
-- Name: Clinic Clinic_slug_key196; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key196" UNIQUE (slug);


--
-- TOC entry 4939 (class 2606 OID 126690)
-- Name: Clinic Clinic_slug_key197; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key197" UNIQUE (slug);


--
-- TOC entry 4941 (class 2606 OID 126682)
-- Name: Clinic Clinic_slug_key198; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key198" UNIQUE (slug);


--
-- TOC entry 4943 (class 2606 OID 126684)
-- Name: Clinic Clinic_slug_key199; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key199" UNIQUE (slug);


--
-- TOC entry 4945 (class 2606 OID 126766)
-- Name: Clinic Clinic_slug_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key2" UNIQUE (slug);


--
-- TOC entry 4947 (class 2606 OID 126992)
-- Name: Clinic Clinic_slug_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key20" UNIQUE (slug);


--
-- TOC entry 4949 (class 2606 OID 126686)
-- Name: Clinic Clinic_slug_key200; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key200" UNIQUE (slug);


--
-- TOC entry 4951 (class 2606 OID 126688)
-- Name: Clinic Clinic_slug_key201; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key201" UNIQUE (slug);


--
-- TOC entry 4953 (class 2606 OID 127018)
-- Name: Clinic Clinic_slug_key202; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key202" UNIQUE (slug);


--
-- TOC entry 4955 (class 2606 OID 127020)
-- Name: Clinic Clinic_slug_key203; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key203" UNIQUE (slug);


--
-- TOC entry 4957 (class 2606 OID 127022)
-- Name: Clinic Clinic_slug_key204; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key204" UNIQUE (slug);


--
-- TOC entry 4959 (class 2606 OID 126632)
-- Name: Clinic Clinic_slug_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key21" UNIQUE (slug);


--
-- TOC entry 4961 (class 2606 OID 126994)
-- Name: Clinic Clinic_slug_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key22" UNIQUE (slug);


--
-- TOC entry 4963 (class 2606 OID 126754)
-- Name: Clinic Clinic_slug_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key23" UNIQUE (slug);


--
-- TOC entry 4965 (class 2606 OID 126630)
-- Name: Clinic Clinic_slug_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key24" UNIQUE (slug);


--
-- TOC entry 4967 (class 2606 OID 126628)
-- Name: Clinic Clinic_slug_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key25" UNIQUE (slug);


--
-- TOC entry 4969 (class 2606 OID 126996)
-- Name: Clinic Clinic_slug_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key26" UNIQUE (slug);


--
-- TOC entry 4971 (class 2606 OID 126998)
-- Name: Clinic Clinic_slug_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key27" UNIQUE (slug);


--
-- TOC entry 4973 (class 2606 OID 126626)
-- Name: Clinic Clinic_slug_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key28" UNIQUE (slug);


--
-- TOC entry 4975 (class 2606 OID 127000)
-- Name: Clinic Clinic_slug_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key29" UNIQUE (slug);


--
-- TOC entry 4977 (class 2606 OID 126768)
-- Name: Clinic Clinic_slug_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key3" UNIQUE (slug);


--
-- TOC entry 4979 (class 2606 OID 127002)
-- Name: Clinic Clinic_slug_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key30" UNIQUE (slug);


--
-- TOC entry 4981 (class 2606 OID 126624)
-- Name: Clinic Clinic_slug_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key31" UNIQUE (slug);


--
-- TOC entry 4983 (class 2606 OID 127004)
-- Name: Clinic Clinic_slug_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key32" UNIQUE (slug);


--
-- TOC entry 4985 (class 2606 OID 126720)
-- Name: Clinic Clinic_slug_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key33" UNIQUE (slug);


--
-- TOC entry 4987 (class 2606 OID 127006)
-- Name: Clinic Clinic_slug_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key34" UNIQUE (slug);


--
-- TOC entry 4989 (class 2606 OID 126718)
-- Name: Clinic Clinic_slug_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key35" UNIQUE (slug);


--
-- TOC entry 4991 (class 2606 OID 126982)
-- Name: Clinic Clinic_slug_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key36" UNIQUE (slug);


--
-- TOC entry 4993 (class 2606 OID 126716)
-- Name: Clinic Clinic_slug_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key37" UNIQUE (slug);


--
-- TOC entry 4995 (class 2606 OID 127008)
-- Name: Clinic Clinic_slug_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key38" UNIQUE (slug);


--
-- TOC entry 4997 (class 2606 OID 126712)
-- Name: Clinic Clinic_slug_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key39" UNIQUE (slug);


--
-- TOC entry 4999 (class 2606 OID 126758)
-- Name: Clinic Clinic_slug_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key4" UNIQUE (slug);


--
-- TOC entry 5001 (class 2606 OID 127010)
-- Name: Clinic Clinic_slug_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key40" UNIQUE (slug);


--
-- TOC entry 5003 (class 2606 OID 127012)
-- Name: Clinic Clinic_slug_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key41" UNIQUE (slug);


--
-- TOC entry 5005 (class 2606 OID 126710)
-- Name: Clinic Clinic_slug_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key42" UNIQUE (slug);


--
-- TOC entry 5007 (class 2606 OID 126622)
-- Name: Clinic Clinic_slug_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key43" UNIQUE (slug);


--
-- TOC entry 5009 (class 2606 OID 127014)
-- Name: Clinic Clinic_slug_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key44" UNIQUE (slug);


--
-- TOC entry 5011 (class 2606 OID 126620)
-- Name: Clinic Clinic_slug_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key45" UNIQUE (slug);


--
-- TOC entry 5013 (class 2606 OID 127016)
-- Name: Clinic Clinic_slug_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key46" UNIQUE (slug);


--
-- TOC entry 5015 (class 2606 OID 126614)
-- Name: Clinic Clinic_slug_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key47" UNIQUE (slug);


--
-- TOC entry 5017 (class 2606 OID 126910)
-- Name: Clinic Clinic_slug_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key48" UNIQUE (slug);


--
-- TOC entry 5019 (class 2606 OID 126810)
-- Name: Clinic Clinic_slug_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key49" UNIQUE (slug);


--
-- TOC entry 5021 (class 2606 OID 126756)
-- Name: Clinic Clinic_slug_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key5" UNIQUE (slug);


--
-- TOC entry 5023 (class 2606 OID 126908)
-- Name: Clinic Clinic_slug_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key50" UNIQUE (slug);


--
-- TOC entry 5025 (class 2606 OID 126906)
-- Name: Clinic Clinic_slug_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key51" UNIQUE (slug);


--
-- TOC entry 5027 (class 2606 OID 126904)
-- Name: Clinic Clinic_slug_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key52" UNIQUE (slug);


--
-- TOC entry 5029 (class 2606 OID 126902)
-- Name: Clinic Clinic_slug_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key53" UNIQUE (slug);


--
-- TOC entry 5031 (class 2606 OID 126812)
-- Name: Clinic Clinic_slug_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key54" UNIQUE (slug);


--
-- TOC entry 5033 (class 2606 OID 126900)
-- Name: Clinic Clinic_slug_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key55" UNIQUE (slug);


--
-- TOC entry 5035 (class 2606 OID 126814)
-- Name: Clinic Clinic_slug_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key56" UNIQUE (slug);


--
-- TOC entry 5037 (class 2606 OID 126872)
-- Name: Clinic Clinic_slug_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key57" UNIQUE (slug);


--
-- TOC entry 5039 (class 2606 OID 126816)
-- Name: Clinic Clinic_slug_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key58" UNIQUE (slug);


--
-- TOC entry 5041 (class 2606 OID 126868)
-- Name: Clinic Clinic_slug_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key59" UNIQUE (slug);


--
-- TOC entry 5043 (class 2606 OID 126770)
-- Name: Clinic Clinic_slug_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key6" UNIQUE (slug);


--
-- TOC entry 5045 (class 2606 OID 126866)
-- Name: Clinic Clinic_slug_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key60" UNIQUE (slug);


--
-- TOC entry 5047 (class 2606 OID 126818)
-- Name: Clinic Clinic_slug_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key61" UNIQUE (slug);


--
-- TOC entry 5049 (class 2606 OID 126864)
-- Name: Clinic Clinic_slug_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key62" UNIQUE (slug);


--
-- TOC entry 5051 (class 2606 OID 126862)
-- Name: Clinic Clinic_slug_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key63" UNIQUE (slug);


--
-- TOC entry 5053 (class 2606 OID 126860)
-- Name: Clinic Clinic_slug_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key64" UNIQUE (slug);


--
-- TOC entry 5055 (class 2606 OID 126820)
-- Name: Clinic Clinic_slug_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key65" UNIQUE (slug);


--
-- TOC entry 5057 (class 2606 OID 126858)
-- Name: Clinic Clinic_slug_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key66" UNIQUE (slug);


--
-- TOC entry 5059 (class 2606 OID 126618)
-- Name: Clinic Clinic_slug_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key67" UNIQUE (slug);


--
-- TOC entry 5061 (class 2606 OID 126856)
-- Name: Clinic Clinic_slug_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key68" UNIQUE (slug);


--
-- TOC entry 5063 (class 2606 OID 126854)
-- Name: Clinic Clinic_slug_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key69" UNIQUE (slug);


--
-- TOC entry 5065 (class 2606 OID 126750)
-- Name: Clinic Clinic_slug_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key7" UNIQUE (slug);


--
-- TOC entry 5067 (class 2606 OID 126852)
-- Name: Clinic Clinic_slug_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key70" UNIQUE (slug);


--
-- TOC entry 5069 (class 2606 OID 126990)
-- Name: Clinic Clinic_slug_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key71" UNIQUE (slug);


--
-- TOC entry 5071 (class 2606 OID 126848)
-- Name: Clinic Clinic_slug_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key72" UNIQUE (slug);


--
-- TOC entry 5073 (class 2606 OID 126822)
-- Name: Clinic Clinic_slug_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key73" UNIQUE (slug);


--
-- TOC entry 5075 (class 2606 OID 126846)
-- Name: Clinic Clinic_slug_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key74" UNIQUE (slug);


--
-- TOC entry 5077 (class 2606 OID 126824)
-- Name: Clinic Clinic_slug_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key75" UNIQUE (slug);


--
-- TOC entry 5079 (class 2606 OID 126844)
-- Name: Clinic Clinic_slug_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key76" UNIQUE (slug);


--
-- TOC entry 5081 (class 2606 OID 126842)
-- Name: Clinic Clinic_slug_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key77" UNIQUE (slug);


--
-- TOC entry 5083 (class 2606 OID 126840)
-- Name: Clinic Clinic_slug_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key78" UNIQUE (slug);


--
-- TOC entry 5085 (class 2606 OID 126838)
-- Name: Clinic Clinic_slug_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key79" UNIQUE (slug);


--
-- TOC entry 5087 (class 2606 OID 126874)
-- Name: Clinic Clinic_slug_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key8" UNIQUE (slug);


--
-- TOC entry 5089 (class 2606 OID 126836)
-- Name: Clinic Clinic_slug_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key80" UNIQUE (slug);


--
-- TOC entry 5091 (class 2606 OID 126826)
-- Name: Clinic Clinic_slug_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key81" UNIQUE (slug);


--
-- TOC entry 5093 (class 2606 OID 126834)
-- Name: Clinic Clinic_slug_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key82" UNIQUE (slug);


--
-- TOC entry 5095 (class 2606 OID 126830)
-- Name: Clinic Clinic_slug_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key83" UNIQUE (slug);


--
-- TOC entry 5097 (class 2606 OID 126828)
-- Name: Clinic Clinic_slug_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key84" UNIQUE (slug);


--
-- TOC entry 5099 (class 2606 OID 126980)
-- Name: Clinic Clinic_slug_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key85" UNIQUE (slug);


--
-- TOC entry 5101 (class 2606 OID 126644)
-- Name: Clinic Clinic_slug_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key86" UNIQUE (slug);


--
-- TOC entry 5103 (class 2606 OID 126978)
-- Name: Clinic Clinic_slug_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key87" UNIQUE (slug);


--
-- TOC entry 5105 (class 2606 OID 126646)
-- Name: Clinic Clinic_slug_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key88" UNIQUE (slug);


--
-- TOC entry 5107 (class 2606 OID 126976)
-- Name: Clinic Clinic_slug_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key89" UNIQUE (slug);


--
-- TOC entry 5109 (class 2606 OID 126642)
-- Name: Clinic Clinic_slug_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key9" UNIQUE (slug);


--
-- TOC entry 5111 (class 2606 OID 126898)
-- Name: Clinic Clinic_slug_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key90" UNIQUE (slug);


--
-- TOC entry 5113 (class 2606 OID 126974)
-- Name: Clinic Clinic_slug_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key91" UNIQUE (slug);


--
-- TOC entry 5115 (class 2606 OID 126892)
-- Name: Clinic Clinic_slug_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key92" UNIQUE (slug);


--
-- TOC entry 5117 (class 2606 OID 126972)
-- Name: Clinic Clinic_slug_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key93" UNIQUE (slug);


--
-- TOC entry 5119 (class 2606 OID 126970)
-- Name: Clinic Clinic_slug_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key94" UNIQUE (slug);


--
-- TOC entry 5121 (class 2606 OID 126894)
-- Name: Clinic Clinic_slug_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key95" UNIQUE (slug);


--
-- TOC entry 5123 (class 2606 OID 126968)
-- Name: Clinic Clinic_slug_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key96" UNIQUE (slug);


--
-- TOC entry 5125 (class 2606 OID 126896)
-- Name: Clinic Clinic_slug_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key97" UNIQUE (slug);


--
-- TOC entry 5127 (class 2606 OID 126966)
-- Name: Clinic Clinic_slug_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key98" UNIQUE (slug);


--
-- TOC entry 5129 (class 2606 OID 126964)
-- Name: Clinic Clinic_slug_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key99" UNIQUE (slug);


--
-- TOC entry 4703 (class 2606 OID 16721)
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- TOC entry 5299 (class 2606 OID 30761)
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 5139 (class 2606 OID 124540)
-- Name: Order Order_orderNumber_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key" UNIQUE ("orderNumber");


--
-- TOC entry 5141 (class 2606 OID 124546)
-- Name: Order Order_orderNumber_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key1" UNIQUE ("orderNumber");


--
-- TOC entry 5143 (class 2606 OID 124554)
-- Name: Order Order_orderNumber_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key10" UNIQUE ("orderNumber");


--
-- TOC entry 5145 (class 2606 OID 124528)
-- Name: Order Order_orderNumber_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key11" UNIQUE ("orderNumber");


--
-- TOC entry 5147 (class 2606 OID 124556)
-- Name: Order Order_orderNumber_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key12" UNIQUE ("orderNumber");


--
-- TOC entry 5149 (class 2606 OID 124526)
-- Name: Order Order_orderNumber_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key13" UNIQUE ("orderNumber");


--
-- TOC entry 5151 (class 2606 OID 124558)
-- Name: Order Order_orderNumber_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key14" UNIQUE ("orderNumber");


--
-- TOC entry 5153 (class 2606 OID 124524)
-- Name: Order Order_orderNumber_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key15" UNIQUE ("orderNumber");


--
-- TOC entry 5155 (class 2606 OID 124522)
-- Name: Order Order_orderNumber_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key16" UNIQUE ("orderNumber");


--
-- TOC entry 5157 (class 2606 OID 124560)
-- Name: Order Order_orderNumber_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key17" UNIQUE ("orderNumber");


--
-- TOC entry 5159 (class 2606 OID 124562)
-- Name: Order Order_orderNumber_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key18" UNIQUE ("orderNumber");


--
-- TOC entry 5161 (class 2606 OID 124516)
-- Name: Order Order_orderNumber_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key19" UNIQUE ("orderNumber");


--
-- TOC entry 5163 (class 2606 OID 124538)
-- Name: Order Order_orderNumber_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key2" UNIQUE ("orderNumber");


--
-- TOC entry 5165 (class 2606 OID 124514)
-- Name: Order Order_orderNumber_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key20" UNIQUE ("orderNumber");


--
-- TOC entry 5167 (class 2606 OID 124510)
-- Name: Order Order_orderNumber_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key21" UNIQUE ("orderNumber");


--
-- TOC entry 5169 (class 2606 OID 124542)
-- Name: Order Order_orderNumber_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key22" UNIQUE ("orderNumber");


--
-- TOC entry 5171 (class 2606 OID 124564)
-- Name: Order Order_orderNumber_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key23" UNIQUE ("orderNumber");


--
-- TOC entry 5173 (class 2606 OID 124508)
-- Name: Order Order_orderNumber_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key24" UNIQUE ("orderNumber");


--
-- TOC entry 5175 (class 2606 OID 124566)
-- Name: Order Order_orderNumber_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key25" UNIQUE ("orderNumber");


--
-- TOC entry 5177 (class 2606 OID 124506)
-- Name: Order Order_orderNumber_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key26" UNIQUE ("orderNumber");


--
-- TOC entry 5179 (class 2606 OID 124568)
-- Name: Order Order_orderNumber_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key27" UNIQUE ("orderNumber");


--
-- TOC entry 5181 (class 2606 OID 124504)
-- Name: Order Order_orderNumber_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key28" UNIQUE ("orderNumber");


--
-- TOC entry 5183 (class 2606 OID 124520)
-- Name: Order Order_orderNumber_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key29" UNIQUE ("orderNumber");


--
-- TOC entry 5185 (class 2606 OID 124536)
-- Name: Order Order_orderNumber_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key3" UNIQUE ("orderNumber");


--
-- TOC entry 5187 (class 2606 OID 124502)
-- Name: Order Order_orderNumber_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key30" UNIQUE ("orderNumber");


--
-- TOC entry 5189 (class 2606 OID 124500)
-- Name: Order Order_orderNumber_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key31" UNIQUE ("orderNumber");


--
-- TOC entry 5191 (class 2606 OID 124518)
-- Name: Order Order_orderNumber_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key32" UNIQUE ("orderNumber");


--
-- TOC entry 5193 (class 2606 OID 124498)
-- Name: Order Order_orderNumber_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key33" UNIQUE ("orderNumber");


--
-- TOC entry 5195 (class 2606 OID 124570)
-- Name: Order Order_orderNumber_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key34" UNIQUE ("orderNumber");


--
-- TOC entry 5197 (class 2606 OID 124496)
-- Name: Order Order_orderNumber_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key35" UNIQUE ("orderNumber");


--
-- TOC entry 5199 (class 2606 OID 124572)
-- Name: Order Order_orderNumber_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key36" UNIQUE ("orderNumber");


--
-- TOC entry 5201 (class 2606 OID 124494)
-- Name: Order Order_orderNumber_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key37" UNIQUE ("orderNumber");


--
-- TOC entry 5203 (class 2606 OID 124492)
-- Name: Order Order_orderNumber_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key38" UNIQUE ("orderNumber");


--
-- TOC entry 5205 (class 2606 OID 124490)
-- Name: Order Order_orderNumber_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key39" UNIQUE ("orderNumber");


--
-- TOC entry 5207 (class 2606 OID 124548)
-- Name: Order Order_orderNumber_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key4" UNIQUE ("orderNumber");


--
-- TOC entry 5209 (class 2606 OID 124488)
-- Name: Order Order_orderNumber_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key40" UNIQUE ("orderNumber");


--
-- TOC entry 5211 (class 2606 OID 124574)
-- Name: Order Order_orderNumber_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key41" UNIQUE ("orderNumber");


--
-- TOC entry 5213 (class 2606 OID 124486)
-- Name: Order Order_orderNumber_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key42" UNIQUE ("orderNumber");


--
-- TOC entry 5215 (class 2606 OID 124484)
-- Name: Order Order_orderNumber_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key43" UNIQUE ("orderNumber");


--
-- TOC entry 5217 (class 2606 OID 124576)
-- Name: Order Order_orderNumber_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key44" UNIQUE ("orderNumber");


--
-- TOC entry 5219 (class 2606 OID 124482)
-- Name: Order Order_orderNumber_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key45" UNIQUE ("orderNumber");


--
-- TOC entry 5221 (class 2606 OID 124480)
-- Name: Order Order_orderNumber_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key46" UNIQUE ("orderNumber");


--
-- TOC entry 5223 (class 2606 OID 124478)
-- Name: Order Order_orderNumber_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key47" UNIQUE ("orderNumber");


--
-- TOC entry 5225 (class 2606 OID 124578)
-- Name: Order Order_orderNumber_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key48" UNIQUE ("orderNumber");


--
-- TOC entry 5227 (class 2606 OID 124474)
-- Name: Order Order_orderNumber_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key49" UNIQUE ("orderNumber");


--
-- TOC entry 5229 (class 2606 OID 124534)
-- Name: Order Order_orderNumber_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key5" UNIQUE ("orderNumber");


--
-- TOC entry 5231 (class 2606 OID 124580)
-- Name: Order Order_orderNumber_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key50" UNIQUE ("orderNumber");


--
-- TOC entry 5233 (class 2606 OID 124472)
-- Name: Order Order_orderNumber_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key51" UNIQUE ("orderNumber");


--
-- TOC entry 5235 (class 2606 OID 124470)
-- Name: Order Order_orderNumber_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key52" UNIQUE ("orderNumber");


--
-- TOC entry 5237 (class 2606 OID 124468)
-- Name: Order Order_orderNumber_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key53" UNIQUE ("orderNumber");


--
-- TOC entry 5239 (class 2606 OID 124512)
-- Name: Order Order_orderNumber_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key54" UNIQUE ("orderNumber");


--
-- TOC entry 5241 (class 2606 OID 124466)
-- Name: Order Order_orderNumber_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key55" UNIQUE ("orderNumber");


--
-- TOC entry 5243 (class 2606 OID 124584)
-- Name: Order Order_orderNumber_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key56" UNIQUE ("orderNumber");


--
-- TOC entry 5245 (class 2606 OID 124464)
-- Name: Order Order_orderNumber_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key57" UNIQUE ("orderNumber");


--
-- TOC entry 5247 (class 2606 OID 124462)
-- Name: Order Order_orderNumber_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key58" UNIQUE ("orderNumber");


--
-- TOC entry 5249 (class 2606 OID 124586)
-- Name: Order Order_orderNumber_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key59" UNIQUE ("orderNumber");


--
-- TOC entry 5251 (class 2606 OID 124550)
-- Name: Order Order_orderNumber_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key6" UNIQUE ("orderNumber");


--
-- TOC entry 5253 (class 2606 OID 124460)
-- Name: Order Order_orderNumber_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key60" UNIQUE ("orderNumber");


--
-- TOC entry 5255 (class 2606 OID 124458)
-- Name: Order Order_orderNumber_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key61" UNIQUE ("orderNumber");


--
-- TOC entry 5257 (class 2606 OID 124588)
-- Name: Order Order_orderNumber_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key62" UNIQUE ("orderNumber");


--
-- TOC entry 5259 (class 2606 OID 124456)
-- Name: Order Order_orderNumber_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key63" UNIQUE ("orderNumber");


--
-- TOC entry 5261 (class 2606 OID 124454)
-- Name: Order Order_orderNumber_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key64" UNIQUE ("orderNumber");


--
-- TOC entry 5263 (class 2606 OID 124582)
-- Name: Order Order_orderNumber_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key65" UNIQUE ("orderNumber");


--
-- TOC entry 5265 (class 2606 OID 124452)
-- Name: Order Order_orderNumber_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key66" UNIQUE ("orderNumber");


--
-- TOC entry 5267 (class 2606 OID 124450)
-- Name: Order Order_orderNumber_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key67" UNIQUE ("orderNumber");


--
-- TOC entry 5269 (class 2606 OID 124590)
-- Name: Order Order_orderNumber_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key68" UNIQUE ("orderNumber");


--
-- TOC entry 5271 (class 2606 OID 124592)
-- Name: Order Order_orderNumber_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key69" UNIQUE ("orderNumber");


--
-- TOC entry 5273 (class 2606 OID 124552)
-- Name: Order Order_orderNumber_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key7" UNIQUE ("orderNumber");


--
-- TOC entry 5275 (class 2606 OID 124448)
-- Name: Order Order_orderNumber_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key70" UNIQUE ("orderNumber");


--
-- TOC entry 5277 (class 2606 OID 124476)
-- Name: Order Order_orderNumber_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key71" UNIQUE ("orderNumber");


--
-- TOC entry 5279 (class 2606 OID 124594)
-- Name: Order Order_orderNumber_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key72" UNIQUE ("orderNumber");


--
-- TOC entry 5281 (class 2606 OID 124596)
-- Name: Order Order_orderNumber_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key73" UNIQUE ("orderNumber");


--
-- TOC entry 5283 (class 2606 OID 124446)
-- Name: Order Order_orderNumber_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key74" UNIQUE ("orderNumber");


--
-- TOC entry 5285 (class 2606 OID 124598)
-- Name: Order Order_orderNumber_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key75" UNIQUE ("orderNumber");


--
-- TOC entry 5287 (class 2606 OID 124444)
-- Name: Order Order_orderNumber_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key76" UNIQUE ("orderNumber");


--
-- TOC entry 5289 (class 2606 OID 124600)
-- Name: Order Order_orderNumber_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key77" UNIQUE ("orderNumber");


--
-- TOC entry 5291 (class 2606 OID 124544)
-- Name: Order Order_orderNumber_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key78" UNIQUE ("orderNumber");


--
-- TOC entry 5293 (class 2606 OID 124532)
-- Name: Order Order_orderNumber_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key8" UNIQUE ("orderNumber");


--
-- TOC entry 5295 (class 2606 OID 124530)
-- Name: Order Order_orderNumber_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key9" UNIQUE ("orderNumber");


--
-- TOC entry 5297 (class 2606 OID 30737)
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- TOC entry 5301 (class 2606 OID 30806)
-- Name: Payment Payment_orderId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_key" UNIQUE ("orderId");


--
-- TOC entry 5303 (class 2606 OID 30804)
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- TOC entry 5305 (class 2606 OID 124904)
-- Name: Payment Payment_stripePaymentIntentId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5307 (class 2606 OID 124906)
-- Name: Payment Payment_stripePaymentIntentId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key1" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5309 (class 2606 OID 124916)
-- Name: Payment Payment_stripePaymentIntentId_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key10" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5311 (class 2606 OID 124982)
-- Name: Payment Payment_stripePaymentIntentId_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key11" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5313 (class 2606 OID 124918)
-- Name: Payment Payment_stripePaymentIntentId_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key12" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5315 (class 2606 OID 124980)
-- Name: Payment Payment_stripePaymentIntentId_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key13" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5317 (class 2606 OID 124920)
-- Name: Payment Payment_stripePaymentIntentId_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key14" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5319 (class 2606 OID 124978)
-- Name: Payment Payment_stripePaymentIntentId_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key15" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5321 (class 2606 OID 124976)
-- Name: Payment Payment_stripePaymentIntentId_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key16" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5323 (class 2606 OID 124924)
-- Name: Payment Payment_stripePaymentIntentId_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key17" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5325 (class 2606 OID 124928)
-- Name: Payment Payment_stripePaymentIntentId_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key18" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5327 (class 2606 OID 124940)
-- Name: Payment Payment_stripePaymentIntentId_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key19" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5329 (class 2606 OID 124902)
-- Name: Payment Payment_stripePaymentIntentId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key2" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5331 (class 2606 OID 124938)
-- Name: Payment Payment_stripePaymentIntentId_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key20" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5333 (class 2606 OID 124932)
-- Name: Payment Payment_stripePaymentIntentId_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key21" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5335 (class 2606 OID 124922)
-- Name: Payment Payment_stripePaymentIntentId_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key22" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5337 (class 2606 OID 124936)
-- Name: Payment Payment_stripePaymentIntentId_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key23" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5339 (class 2606 OID 124974)
-- Name: Payment Payment_stripePaymentIntentId_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key24" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5341 (class 2606 OID 124942)
-- Name: Payment Payment_stripePaymentIntentId_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key25" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5343 (class 2606 OID 124972)
-- Name: Payment Payment_stripePaymentIntentId_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key26" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5345 (class 2606 OID 124914)
-- Name: Payment Payment_stripePaymentIntentId_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key27" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5347 (class 2606 OID 124970)
-- Name: Payment Payment_stripePaymentIntentId_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key28" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5349 (class 2606 OID 124896)
-- Name: Payment Payment_stripePaymentIntentId_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key29" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5351 (class 2606 OID 124876)
-- Name: Payment Payment_stripePaymentIntentId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key3" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5353 (class 2606 OID 124944)
-- Name: Payment Payment_stripePaymentIntentId_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key30" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5355 (class 2606 OID 124968)
-- Name: Payment Payment_stripePaymentIntentId_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key31" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5357 (class 2606 OID 124946)
-- Name: Payment Payment_stripePaymentIntentId_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key32" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5359 (class 2606 OID 124966)
-- Name: Payment Payment_stripePaymentIntentId_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key33" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5361 (class 2606 OID 124948)
-- Name: Payment Payment_stripePaymentIntentId_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key34" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5363 (class 2606 OID 124964)
-- Name: Payment Payment_stripePaymentIntentId_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key35" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5365 (class 2606 OID 124950)
-- Name: Payment Payment_stripePaymentIntentId_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key36" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5367 (class 2606 OID 124962)
-- Name: Payment Payment_stripePaymentIntentId_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key37" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5369 (class 2606 OID 124960)
-- Name: Payment Payment_stripePaymentIntentId_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key38" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5371 (class 2606 OID 124952)
-- Name: Payment Payment_stripePaymentIntentId_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key39" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5373 (class 2606 OID 124908)
-- Name: Payment Payment_stripePaymentIntentId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key4" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5375 (class 2606 OID 124956)
-- Name: Payment Payment_stripePaymentIntentId_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key40" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5377 (class 2606 OID 124878)
-- Name: Payment Payment_stripePaymentIntentId_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key41" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5379 (class 2606 OID 124954)
-- Name: Payment Payment_stripePaymentIntentId_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key42" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5381 (class 2606 OID 124880)
-- Name: Payment Payment_stripePaymentIntentId_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key43" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5383 (class 2606 OID 124930)
-- Name: Payment Payment_stripePaymentIntentId_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key44" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5385 (class 2606 OID 124894)
-- Name: Payment Payment_stripePaymentIntentId_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key45" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5387 (class 2606 OID 124892)
-- Name: Payment Payment_stripePaymentIntentId_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key46" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5389 (class 2606 OID 124882)
-- Name: Payment Payment_stripePaymentIntentId_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key47" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5391 (class 2606 OID 124934)
-- Name: Payment Payment_stripePaymentIntentId_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key48" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5393 (class 2606 OID 124884)
-- Name: Payment Payment_stripePaymentIntentId_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key49" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5395 (class 2606 OID 124994)
-- Name: Payment Payment_stripePaymentIntentId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key5" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5397 (class 2606 OID 124890)
-- Name: Payment Payment_stripePaymentIntentId_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key50" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5399 (class 2606 OID 124888)
-- Name: Payment Payment_stripePaymentIntentId_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key51" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5401 (class 2606 OID 124886)
-- Name: Payment Payment_stripePaymentIntentId_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key52" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5403 (class 2606 OID 124990)
-- Name: Payment Payment_stripePaymentIntentId_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key53" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5405 (class 2606 OID 124988)
-- Name: Payment Payment_stripePaymentIntentId_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key54" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5407 (class 2606 OID 124986)
-- Name: Payment Payment_stripePaymentIntentId_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key55" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5409 (class 2606 OID 124996)
-- Name: Payment Payment_stripePaymentIntentId_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key56" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5411 (class 2606 OID 124874)
-- Name: Payment Payment_stripePaymentIntentId_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key57" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5413 (class 2606 OID 124998)
-- Name: Payment Payment_stripePaymentIntentId_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key58" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5415 (class 2606 OID 124872)
-- Name: Payment Payment_stripePaymentIntentId_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key59" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5417 (class 2606 OID 124910)
-- Name: Payment Payment_stripePaymentIntentId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key6" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5419 (class 2606 OID 124926)
-- Name: Payment Payment_stripePaymentIntentId_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key60" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5421 (class 2606 OID 125000)
-- Name: Payment Payment_stripePaymentIntentId_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key61" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5423 (class 2606 OID 124870)
-- Name: Payment Payment_stripePaymentIntentId_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key62" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5425 (class 2606 OID 124868)
-- Name: Payment Payment_stripePaymentIntentId_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key63" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5427 (class 2606 OID 125002)
-- Name: Payment Payment_stripePaymentIntentId_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key64" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5429 (class 2606 OID 124866)
-- Name: Payment Payment_stripePaymentIntentId_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key65" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5431 (class 2606 OID 124864)
-- Name: Payment Payment_stripePaymentIntentId_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key66" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5433 (class 2606 OID 124958)
-- Name: Payment Payment_stripePaymentIntentId_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key67" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5435 (class 2606 OID 124900)
-- Name: Payment Payment_stripePaymentIntentId_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key68" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5437 (class 2606 OID 124862)
-- Name: Payment Payment_stripePaymentIntentId_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key69" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5439 (class 2606 OID 124912)
-- Name: Payment Payment_stripePaymentIntentId_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key7" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5441 (class 2606 OID 124898)
-- Name: Payment Payment_stripePaymentIntentId_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key70" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5443 (class 2606 OID 124860)
-- Name: Payment Payment_stripePaymentIntentId_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key71" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5445 (class 2606 OID 125004)
-- Name: Payment Payment_stripePaymentIntentId_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key72" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5447 (class 2606 OID 125006)
-- Name: Payment Payment_stripePaymentIntentId_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key73" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5449 (class 2606 OID 124858)
-- Name: Payment Payment_stripePaymentIntentId_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key74" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5451 (class 2606 OID 124856)
-- Name: Payment Payment_stripePaymentIntentId_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key75" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5453 (class 2606 OID 124854)
-- Name: Payment Payment_stripePaymentIntentId_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key76" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5455 (class 2606 OID 125008)
-- Name: Payment Payment_stripePaymentIntentId_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key77" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5457 (class 2606 OID 124992)
-- Name: Payment Payment_stripePaymentIntentId_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key8" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5459 (class 2606 OID 124984)
-- Name: Payment Payment_stripePaymentIntentId_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key9" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5603 (class 2606 OID 128593)
-- Name: Physician Physician_email_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key" UNIQUE (email);


--
-- TOC entry 5605 (class 2606 OID 128595)
-- Name: Physician Physician_pharmacyPhysicianId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5607 (class 2606 OID 128591)
-- Name: Physician Physician_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pkey" PRIMARY KEY (id);


--
-- TOC entry 4711 (class 2606 OID 16753)
-- Name: PrescriptionProducts PrescriptionProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_pkey" PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 16755)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_productId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_productId_key" UNIQUE ("prescriptionId", "productId");


--
-- TOC entry 4707 (class 2606 OID 16733)
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- TOC entry 4705 (class 2606 OID 16728)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 5137 (class 2606 OID 24386)
-- Name: QuestionOption QuestionOption_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionOption"
    ADD CONSTRAINT "QuestionOption_pkey" PRIMARY KEY (id);


--
-- TOC entry 5135 (class 2606 OID 24374)
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- TOC entry 5133 (class 2606 OID 24337)
-- Name: QuestionnaireStep QuestionnaireStep_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionnaireStep"
    ADD CONSTRAINT "QuestionnaireStep_pkey" PRIMARY KEY (id);


--
-- TOC entry 5131 (class 2606 OID 24325)
-- Name: Questionnaire Questionnaire_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_pkey" PRIMARY KEY (id);


--
-- TOC entry 4320 (class 2606 OID 16485)
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- TOC entry 5461 (class 2606 OID 30821)
-- Name: ShippingAddress ShippingAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY (id);


--
-- TOC entry 5463 (class 2606 OID 40958)
-- Name: ShippingOrder ShippingOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingOrder"
    ADD CONSTRAINT "ShippingOrder_pkey" PRIMARY KEY (id);


--
-- TOC entry 5465 (class 2606 OID 40980)
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- TOC entry 5467 (class 2606 OID 125263)
-- Name: Subscription Subscription_stripeSubscriptionId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5469 (class 2606 OID 125261)
-- Name: Subscription Subscription_stripeSubscriptionId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key1" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5471 (class 2606 OID 125251)
-- Name: Subscription Subscription_stripeSubscriptionId_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key10" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5473 (class 2606 OID 125249)
-- Name: Subscription Subscription_stripeSubscriptionId_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key11" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5475 (class 2606 OID 125213)
-- Name: Subscription Subscription_stripeSubscriptionId_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key12" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5477 (class 2606 OID 125245)
-- Name: Subscription Subscription_stripeSubscriptionId_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key13" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5479 (class 2606 OID 125215)
-- Name: Subscription Subscription_stripeSubscriptionId_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key14" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5481 (class 2606 OID 125243)
-- Name: Subscription Subscription_stripeSubscriptionId_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key15" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5483 (class 2606 OID 125241)
-- Name: Subscription Subscription_stripeSubscriptionId_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key16" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5485 (class 2606 OID 125217)
-- Name: Subscription Subscription_stripeSubscriptionId_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key17" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5487 (class 2606 OID 125239)
-- Name: Subscription Subscription_stripeSubscriptionId_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key18" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5489 (class 2606 OID 125273)
-- Name: Subscription Subscription_stripeSubscriptionId_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key19" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5491 (class 2606 OID 125265)
-- Name: Subscription Subscription_stripeSubscriptionId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key2" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5493 (class 2606 OID 125237)
-- Name: Subscription Subscription_stripeSubscriptionId_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key20" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5495 (class 2606 OID 125275)
-- Name: Subscription Subscription_stripeSubscriptionId_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key21" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5497 (class 2606 OID 125235)
-- Name: Subscription Subscription_stripeSubscriptionId_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key22" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5499 (class 2606 OID 125277)
-- Name: Subscription Subscription_stripeSubscriptionId_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key23" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5501 (class 2606 OID 125233)
-- Name: Subscription Subscription_stripeSubscriptionId_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key24" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5503 (class 2606 OID 125231)
-- Name: Subscription Subscription_stripeSubscriptionId_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key25" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5505 (class 2606 OID 125229)
-- Name: Subscription Subscription_stripeSubscriptionId_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key26" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5507 (class 2606 OID 125211)
-- Name: Subscription Subscription_stripeSubscriptionId_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key27" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5509 (class 2606 OID 125279)
-- Name: Subscription Subscription_stripeSubscriptionId_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key28" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5511 (class 2606 OID 125281)
-- Name: Subscription Subscription_stripeSubscriptionId_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key29" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5513 (class 2606 OID 125259)
-- Name: Subscription Subscription_stripeSubscriptionId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key3" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5515 (class 2606 OID 125227)
-- Name: Subscription Subscription_stripeSubscriptionId_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key30" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5517 (class 2606 OID 125225)
-- Name: Subscription Subscription_stripeSubscriptionId_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key31" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5519 (class 2606 OID 125283)
-- Name: Subscription Subscription_stripeSubscriptionId_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key32" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5521 (class 2606 OID 125223)
-- Name: Subscription Subscription_stripeSubscriptionId_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key33" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5523 (class 2606 OID 125285)
-- Name: Subscription Subscription_stripeSubscriptionId_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key34" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5525 (class 2606 OID 125287)
-- Name: Subscription Subscription_stripeSubscriptionId_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key35" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5527 (class 2606 OID 125221)
-- Name: Subscription Subscription_stripeSubscriptionId_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key36" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5529 (class 2606 OID 125219)
-- Name: Subscription Subscription_stripeSubscriptionId_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key37" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5531 (class 2606 OID 125289)
-- Name: Subscription Subscription_stripeSubscriptionId_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key38" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5533 (class 2606 OID 125207)
-- Name: Subscription Subscription_stripeSubscriptionId_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key39" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5535 (class 2606 OID 125267)
-- Name: Subscription Subscription_stripeSubscriptionId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key4" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5537 (class 2606 OID 125205)
-- Name: Subscription Subscription_stripeSubscriptionId_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key40" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5539 (class 2606 OID 125291)
-- Name: Subscription Subscription_stripeSubscriptionId_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key41" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5541 (class 2606 OID 125203)
-- Name: Subscription Subscription_stripeSubscriptionId_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key42" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5543 (class 2606 OID 125201)
-- Name: Subscription Subscription_stripeSubscriptionId_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key43" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5545 (class 2606 OID 125293)
-- Name: Subscription Subscription_stripeSubscriptionId_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key44" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5547 (class 2606 OID 125199)
-- Name: Subscription Subscription_stripeSubscriptionId_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key45" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5549 (class 2606 OID 125197)
-- Name: Subscription Subscription_stripeSubscriptionId_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key46" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5551 (class 2606 OID 125195)
-- Name: Subscription Subscription_stripeSubscriptionId_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key47" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5553 (class 2606 OID 125295)
-- Name: Subscription Subscription_stripeSubscriptionId_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key48" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5555 (class 2606 OID 125297)
-- Name: Subscription Subscription_stripeSubscriptionId_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key49" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5557 (class 2606 OID 125255)
-- Name: Subscription Subscription_stripeSubscriptionId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key5" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5559 (class 2606 OID 125193)
-- Name: Subscription Subscription_stripeSubscriptionId_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key50" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5561 (class 2606 OID 125191)
-- Name: Subscription Subscription_stripeSubscriptionId_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key51" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5563 (class 2606 OID 125299)
-- Name: Subscription Subscription_stripeSubscriptionId_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key52" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5565 (class 2606 OID 125301)
-- Name: Subscription Subscription_stripeSubscriptionId_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key53" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5567 (class 2606 OID 125189)
-- Name: Subscription Subscription_stripeSubscriptionId_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key54" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5569 (class 2606 OID 125257)
-- Name: Subscription Subscription_stripeSubscriptionId_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key55" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5571 (class 2606 OID 125187)
-- Name: Subscription Subscription_stripeSubscriptionId_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key56" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5573 (class 2606 OID 125209)
-- Name: Subscription Subscription_stripeSubscriptionId_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key57" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5575 (class 2606 OID 125269)
-- Name: Subscription Subscription_stripeSubscriptionId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key6" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5577 (class 2606 OID 125271)
-- Name: Subscription Subscription_stripeSubscriptionId_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key7" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5579 (class 2606 OID 125253)
-- Name: Subscription Subscription_stripeSubscriptionId_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key8" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5581 (class 2606 OID 125247)
-- Name: Subscription Subscription_stripeSubscriptionId_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key9" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 5583 (class 2606 OID 50766)
-- Name: TreatmentPlan TreatmentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentPlan"
    ADD CONSTRAINT "TreatmentPlan_pkey" PRIMARY KEY (id);


--
-- TOC entry 4715 (class 2606 OID 16770)
-- Name: TreatmentProducts TreatmentProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_pkey" PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 16772)
-- Name: TreatmentProducts TreatmentProducts_productId_treatmentId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_productId_treatmentId_key" UNIQUE ("productId", "treatmentId");


--
-- TOC entry 4709 (class 2606 OID 16743)
-- Name: Treatment Treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4323 (class 2606 OID 16512)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 4325 (class 2606 OID 128204)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4327 (class 2606 OID 128172)
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- TOC entry 4329 (class 2606 OID 128430)
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- TOC entry 4331 (class 2606 OID 128468)
-- Name: users users_email_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key100 UNIQUE (email);


--
-- TOC entry 4333 (class 2606 OID 128370)
-- Name: users users_email_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key101 UNIQUE (email);


--
-- TOC entry 4335 (class 2606 OID 128200)
-- Name: users users_email_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key102 UNIQUE (email);


--
-- TOC entry 4337 (class 2606 OID 128394)
-- Name: users users_email_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key103 UNIQUE (email);


--
-- TOC entry 4339 (class 2606 OID 128198)
-- Name: users users_email_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key104 UNIQUE (email);


--
-- TOC entry 4341 (class 2606 OID 128518)
-- Name: users users_email_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key105 UNIQUE (email);


--
-- TOC entry 4343 (class 2606 OID 128196)
-- Name: users users_email_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key106 UNIQUE (email);


--
-- TOC entry 4345 (class 2606 OID 128194)
-- Name: users users_email_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key107 UNIQUE (email);


--
-- TOC entry 4347 (class 2606 OID 128498)
-- Name: users users_email_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key108 UNIQUE (email);


--
-- TOC entry 4349 (class 2606 OID 128400)
-- Name: users users_email_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key109 UNIQUE (email);


--
-- TOC entry 4351 (class 2606 OID 128396)
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- TOC entry 4353 (class 2606 OID 128384)
-- Name: users users_email_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key110 UNIQUE (email);


--
-- TOC entry 4355 (class 2606 OID 128272)
-- Name: users users_email_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key111 UNIQUE (email);


--
-- TOC entry 4357 (class 2606 OID 128382)
-- Name: users users_email_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key112 UNIQUE (email);


--
-- TOC entry 4359 (class 2606 OID 128274)
-- Name: users users_email_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key113 UNIQUE (email);


--
-- TOC entry 4361 (class 2606 OID 128222)
-- Name: users users_email_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key114 UNIQUE (email);


--
-- TOC entry 4363 (class 2606 OID 128276)
-- Name: users users_email_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key115 UNIQUE (email);


--
-- TOC entry 4365 (class 2606 OID 128220)
-- Name: users users_email_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key116 UNIQUE (email);


--
-- TOC entry 4367 (class 2606 OID 128368)
-- Name: users users_email_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key117 UNIQUE (email);


--
-- TOC entry 4369 (class 2606 OID 128460)
-- Name: users users_email_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key118 UNIQUE (email);


--
-- TOC entry 4371 (class 2606 OID 128458)
-- Name: users users_email_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key119 UNIQUE (email);


--
-- TOC entry 4373 (class 2606 OID 128420)
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- TOC entry 4375 (class 2606 OID 128278)
-- Name: users users_email_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key120 UNIQUE (email);


--
-- TOC entry 4377 (class 2606 OID 128454)
-- Name: users users_email_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key121 UNIQUE (email);


--
-- TOC entry 4379 (class 2606 OID 128452)
-- Name: users users_email_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key122 UNIQUE (email);


--
-- TOC entry 4381 (class 2606 OID 128336)
-- Name: users users_email_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key123 UNIQUE (email);


--
-- TOC entry 4383 (class 2606 OID 128282)
-- Name: users users_email_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key124 UNIQUE (email);


--
-- TOC entry 4385 (class 2606 OID 128340)
-- Name: users users_email_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key125 UNIQUE (email);


--
-- TOC entry 4387 (class 2606 OID 128344)
-- Name: users users_email_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key126 UNIQUE (email);


--
-- TOC entry 4389 (class 2606 OID 128280)
-- Name: users users_email_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key127 UNIQUE (email);


--
-- TOC entry 4391 (class 2606 OID 128286)
-- Name: users users_email_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key128 UNIQUE (email);


--
-- TOC entry 4393 (class 2606 OID 128164)
-- Name: users users_email_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key129 UNIQUE (email);


--
-- TOC entry 4395 (class 2606 OID 128536)
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- TOC entry 4397 (class 2606 OID 128242)
-- Name: users users_email_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key130 UNIQUE (email);


--
-- TOC entry 4399 (class 2606 OID 128188)
-- Name: users users_email_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key131 UNIQUE (email);


--
-- TOC entry 4401 (class 2606 OID 128466)
-- Name: users users_email_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key132 UNIQUE (email);


--
-- TOC entry 4403 (class 2606 OID 128244)
-- Name: users users_email_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key133 UNIQUE (email);


--
-- TOC entry 4405 (class 2606 OID 128464)
-- Name: users users_email_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key134 UNIQUE (email);


--
-- TOC entry 4407 (class 2606 OID 128346)
-- Name: users users_email_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key135 UNIQUE (email);


--
-- TOC entry 4409 (class 2606 OID 128354)
-- Name: users users_email_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key136 UNIQUE (email);


--
-- TOC entry 4411 (class 2606 OID 128462)
-- Name: users users_email_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key137 UNIQUE (email);


--
-- TOC entry 4413 (class 2606 OID 128526)
-- Name: users users_email_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key138 UNIQUE (email);


--
-- TOC entry 4415 (class 2606 OID 128342)
-- Name: users users_email_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key139 UNIQUE (email);


--
-- TOC entry 4417 (class 2606 OID 128182)
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- TOC entry 4419 (class 2606 OID 128246)
-- Name: users users_email_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key140 UNIQUE (email);


--
-- TOC entry 4421 (class 2606 OID 128532)
-- Name: users users_email_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key141 UNIQUE (email);


--
-- TOC entry 4423 (class 2606 OID 128538)
-- Name: users users_email_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key142 UNIQUE (email);


--
-- TOC entry 4425 (class 2606 OID 128488)
-- Name: users users_email_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key143 UNIQUE (email);


--
-- TOC entry 4427 (class 2606 OID 128456)
-- Name: users users_email_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key144 UNIQUE (email);


--
-- TOC entry 4429 (class 2606 OID 128450)
-- Name: users users_email_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key145 UNIQUE (email);


--
-- TOC entry 4431 (class 2606 OID 128448)
-- Name: users users_email_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key146 UNIQUE (email);


--
-- TOC entry 4433 (class 2606 OID 128438)
-- Name: users users_email_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key147 UNIQUE (email);


--
-- TOC entry 4435 (class 2606 OID 128446)
-- Name: users users_email_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key148 UNIQUE (email);


--
-- TOC entry 4437 (class 2606 OID 128470)
-- Name: users users_email_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key149 UNIQUE (email);


--
-- TOC entry 4439 (class 2606 OID 128418)
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- TOC entry 4441 (class 2606 OID 128440)
-- Name: users users_email_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key150 UNIQUE (email);


--
-- TOC entry 4443 (class 2606 OID 128444)
-- Name: users users_email_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key151 UNIQUE (email);


--
-- TOC entry 4445 (class 2606 OID 128442)
-- Name: users users_email_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key152 UNIQUE (email);


--
-- TOC entry 4447 (class 2606 OID 128406)
-- Name: users users_email_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key153 UNIQUE (email);


--
-- TOC entry 4449 (class 2606 OID 128296)
-- Name: users users_email_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key154 UNIQUE (email);


--
-- TOC entry 4451 (class 2606 OID 128404)
-- Name: users users_email_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key155 UNIQUE (email);


--
-- TOC entry 4453 (class 2606 OID 128524)
-- Name: users users_email_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key156 UNIQUE (email);


--
-- TOC entry 4455 (class 2606 OID 128298)
-- Name: users users_email_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key157 UNIQUE (email);


--
-- TOC entry 4457 (class 2606 OID 128522)
-- Name: users users_email_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key158 UNIQUE (email);


--
-- TOC entry 4459 (class 2606 OID 128300)
-- Name: users users_email_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key159 UNIQUE (email);


--
-- TOC entry 4461 (class 2606 OID 128186)
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- TOC entry 4463 (class 2606 OID 128528)
-- Name: users users_email_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key160 UNIQUE (email);


--
-- TOC entry 4465 (class 2606 OID 128510)
-- Name: users users_email_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key161 UNIQUE (email);


--
-- TOC entry 4467 (class 2606 OID 128374)
-- Name: users users_email_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key162 UNIQUE (email);


--
-- TOC entry 4469 (class 2606 OID 128352)
-- Name: users users_email_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key163 UNIQUE (email);


--
-- TOC entry 4471 (class 2606 OID 128302)
-- Name: users users_email_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key164 UNIQUE (email);


--
-- TOC entry 4473 (class 2606 OID 128304)
-- Name: users users_email_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key165 UNIQUE (email);


--
-- TOC entry 4475 (class 2606 OID 128350)
-- Name: users users_email_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key166 UNIQUE (email);


--
-- TOC entry 4477 (class 2606 OID 128306)
-- Name: users users_email_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key167 UNIQUE (email);


--
-- TOC entry 4479 (class 2606 OID 128348)
-- Name: users users_email_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key168 UNIQUE (email);


--
-- TOC entry 4481 (class 2606 OID 128334)
-- Name: users users_email_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key169 UNIQUE (email);


--
-- TOC entry 4483 (class 2606 OID 128372)
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- TOC entry 4485 (class 2606 OID 128170)
-- Name: users users_email_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key170 UNIQUE (email);


--
-- TOC entry 4487 (class 2606 OID 128332)
-- Name: users users_email_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key171 UNIQUE (email);


--
-- TOC entry 4489 (class 2606 OID 128330)
-- Name: users users_email_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key172 UNIQUE (email);


--
-- TOC entry 4491 (class 2606 OID 128328)
-- Name: users users_email_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key173 UNIQUE (email);


--
-- TOC entry 4493 (class 2606 OID 128338)
-- Name: users users_email_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key174 UNIQUE (email);


--
-- TOC entry 4495 (class 2606 OID 128362)
-- Name: users users_email_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key175 UNIQUE (email);


--
-- TOC entry 4497 (class 2606 OID 128326)
-- Name: users users_email_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key176 UNIQUE (email);


--
-- TOC entry 4499 (class 2606 OID 128308)
-- Name: users users_email_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key177 UNIQUE (email);


--
-- TOC entry 4501 (class 2606 OID 128310)
-- Name: users users_email_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key178 UNIQUE (email);


--
-- TOC entry 4503 (class 2606 OID 128312)
-- Name: users users_email_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key179 UNIQUE (email);


--
-- TOC entry 4505 (class 2606 OID 128516)
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- TOC entry 4507 (class 2606 OID 128324)
-- Name: users users_email_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key180 UNIQUE (email);


--
-- TOC entry 4509 (class 2606 OID 128314)
-- Name: users users_email_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key181 UNIQUE (email);


--
-- TOC entry 4511 (class 2606 OID 128322)
-- Name: users users_email_key182; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key182 UNIQUE (email);


--
-- TOC entry 4513 (class 2606 OID 128320)
-- Name: users users_email_key183; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key183 UNIQUE (email);


--
-- TOC entry 4515 (class 2606 OID 128318)
-- Name: users users_email_key184; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key184 UNIQUE (email);


--
-- TOC entry 4517 (class 2606 OID 128316)
-- Name: users users_email_key185; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key185 UNIQUE (email);


--
-- TOC entry 4519 (class 2606 OID 128174)
-- Name: users users_email_key186; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key186 UNIQUE (email);


--
-- TOC entry 4521 (class 2606 OID 128176)
-- Name: users users_email_key187; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key187 UNIQUE (email);


--
-- TOC entry 4523 (class 2606 OID 128416)
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- TOC entry 4525 (class 2606 OID 128236)
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- TOC entry 4527 (class 2606 OID 128492)
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- TOC entry 4529 (class 2606 OID 128414)
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- TOC entry 4531 (class 2606 OID 128494)
-- Name: users users_email_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key22 UNIQUE (email);


--
-- TOC entry 4533 (class 2606 OID 128262)
-- Name: users users_email_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key23 UNIQUE (email);


--
-- TOC entry 4535 (class 2606 OID 128366)
-- Name: users users_email_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key24 UNIQUE (email);


--
-- TOC entry 4537 (class 2606 OID 128390)
-- Name: users users_email_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key25 UNIQUE (email);


--
-- TOC entry 4539 (class 2606 OID 128260)
-- Name: users users_email_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key26 UNIQUE (email);


--
-- TOC entry 4541 (class 2606 OID 128520)
-- Name: users users_email_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key27 UNIQUE (email);


--
-- TOC entry 4543 (class 2606 OID 128224)
-- Name: users users_email_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key28 UNIQUE (email);


--
-- TOC entry 4545 (class 2606 OID 128258)
-- Name: users users_email_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key29 UNIQUE (email);


--
-- TOC entry 4547 (class 2606 OID 128472)
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- TOC entry 4549 (class 2606 OID 128256)
-- Name: users users_email_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key30 UNIQUE (email);


--
-- TOC entry 4551 (class 2606 OID 128226)
-- Name: users users_email_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key31 UNIQUE (email);


--
-- TOC entry 4553 (class 2606 OID 128228)
-- Name: users users_email_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key32 UNIQUE (email);


--
-- TOC entry 4555 (class 2606 OID 128230)
-- Name: users users_email_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key33 UNIQUE (email);


--
-- TOC entry 4557 (class 2606 OID 128534)
-- Name: users users_email_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key34 UNIQUE (email);


--
-- TOC entry 4559 (class 2606 OID 128398)
-- Name: users users_email_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key35 UNIQUE (email);


--
-- TOC entry 4561 (class 2606 OID 128402)
-- Name: users users_email_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key36 UNIQUE (email);


--
-- TOC entry 4563 (class 2606 OID 128478)
-- Name: users users_email_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key37 UNIQUE (email);


--
-- TOC entry 4565 (class 2606 OID 128530)
-- Name: users users_email_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key38 UNIQUE (email);


--
-- TOC entry 4567 (class 2606 OID 128480)
-- Name: users users_email_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key39 UNIQUE (email);


--
-- TOC entry 4569 (class 2606 OID 128474)
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- TOC entry 4571 (class 2606 OID 128490)
-- Name: users users_email_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key40 UNIQUE (email);


--
-- TOC entry 4573 (class 2606 OID 128264)
-- Name: users users_email_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key41 UNIQUE (email);


--
-- TOC entry 4575 (class 2606 OID 128484)
-- Name: users users_email_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key42 UNIQUE (email);


--
-- TOC entry 4577 (class 2606 OID 128482)
-- Name: users users_email_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key43 UNIQUE (email);


--
-- TOC entry 4579 (class 2606 OID 128178)
-- Name: users users_email_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key44 UNIQUE (email);


--
-- TOC entry 4581 (class 2606 OID 128294)
-- Name: users users_email_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key45 UNIQUE (email);


--
-- TOC entry 4583 (class 2606 OID 128292)
-- Name: users users_email_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key46 UNIQUE (email);


--
-- TOC entry 4585 (class 2606 OID 128266)
-- Name: users users_email_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key47 UNIQUE (email);


--
-- TOC entry 4587 (class 2606 OID 128268)
-- Name: users users_email_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key48 UNIQUE (email);


--
-- TOC entry 4589 (class 2606 OID 128206)
-- Name: users users_email_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key49 UNIQUE (email);


--
-- TOC entry 4591 (class 2606 OID 128168)
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- TOC entry 4593 (class 2606 OID 128386)
-- Name: users users_email_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key50 UNIQUE (email);


--
-- TOC entry 4595 (class 2606 OID 128192)
-- Name: users users_email_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key51 UNIQUE (email);


--
-- TOC entry 4597 (class 2606 OID 128512)
-- Name: users users_email_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key52 UNIQUE (email);


--
-- TOC entry 4599 (class 2606 OID 128506)
-- Name: users users_email_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key53 UNIQUE (email);


--
-- TOC entry 4601 (class 2606 OID 128190)
-- Name: users users_email_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key54 UNIQUE (email);


--
-- TOC entry 4603 (class 2606 OID 128212)
-- Name: users users_email_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key55 UNIQUE (email);


--
-- TOC entry 4605 (class 2606 OID 128240)
-- Name: users users_email_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key56 UNIQUE (email);


--
-- TOC entry 4607 (class 2606 OID 128214)
-- Name: users users_email_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key57 UNIQUE (email);


--
-- TOC entry 4609 (class 2606 OID 128238)
-- Name: users users_email_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key58 UNIQUE (email);


--
-- TOC entry 4611 (class 2606 OID 128216)
-- Name: users users_email_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key59 UNIQUE (email);


--
-- TOC entry 4613 (class 2606 OID 128476)
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- TOC entry 4615 (class 2606 OID 128508)
-- Name: users users_email_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key60 UNIQUE (email);


--
-- TOC entry 4617 (class 2606 OID 128210)
-- Name: users users_email_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key61 UNIQUE (email);


--
-- TOC entry 4619 (class 2606 OID 128486)
-- Name: users users_email_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key62 UNIQUE (email);


--
-- TOC entry 4621 (class 2606 OID 128202)
-- Name: users users_email_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key63 UNIQUE (email);


--
-- TOC entry 4623 (class 2606 OID 128436)
-- Name: users users_email_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key64 UNIQUE (email);


--
-- TOC entry 4625 (class 2606 OID 128254)
-- Name: users users_email_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key65 UNIQUE (email);


--
-- TOC entry 4627 (class 2606 OID 128250)
-- Name: users users_email_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key66 UNIQUE (email);


--
-- TOC entry 4629 (class 2606 OID 128252)
-- Name: users users_email_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key67 UNIQUE (email);


--
-- TOC entry 4631 (class 2606 OID 128218)
-- Name: users users_email_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key68 UNIQUE (email);


--
-- TOC entry 4633 (class 2606 OID 128166)
-- Name: users users_email_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key69 UNIQUE (email);


--
-- TOC entry 4635 (class 2606 OID 128434)
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- TOC entry 4637 (class 2606 OID 128388)
-- Name: users users_email_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key70 UNIQUE (email);


--
-- TOC entry 4639 (class 2606 OID 128504)
-- Name: users users_email_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key71 UNIQUE (email);


--
-- TOC entry 4641 (class 2606 OID 128248)
-- Name: users users_email_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key72 UNIQUE (email);


--
-- TOC entry 4643 (class 2606 OID 128502)
-- Name: users users_email_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key73 UNIQUE (email);


--
-- TOC entry 4645 (class 2606 OID 128500)
-- Name: users users_email_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key74 UNIQUE (email);


--
-- TOC entry 4647 (class 2606 OID 128208)
-- Name: users users_email_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key75 UNIQUE (email);


--
-- TOC entry 4649 (class 2606 OID 128358)
-- Name: users users_email_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key76 UNIQUE (email);


--
-- TOC entry 4651 (class 2606 OID 128180)
-- Name: users users_email_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key77 UNIQUE (email);


--
-- TOC entry 4653 (class 2606 OID 128184)
-- Name: users users_email_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key78 UNIQUE (email);


--
-- TOC entry 4655 (class 2606 OID 128234)
-- Name: users users_email_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key79 UNIQUE (email);


--
-- TOC entry 4657 (class 2606 OID 128432)
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- TOC entry 4659 (class 2606 OID 128232)
-- Name: users users_email_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key80 UNIQUE (email);


--
-- TOC entry 4661 (class 2606 OID 128428)
-- Name: users users_email_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key81 UNIQUE (email);


--
-- TOC entry 4663 (class 2606 OID 128422)
-- Name: users users_email_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key82 UNIQUE (email);


--
-- TOC entry 4665 (class 2606 OID 128514)
-- Name: users users_email_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key83 UNIQUE (email);


--
-- TOC entry 4667 (class 2606 OID 128426)
-- Name: users users_email_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key84 UNIQUE (email);


--
-- TOC entry 4669 (class 2606 OID 128424)
-- Name: users users_email_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key85 UNIQUE (email);


--
-- TOC entry 4671 (class 2606 OID 128412)
-- Name: users users_email_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key86 UNIQUE (email);


--
-- TOC entry 4673 (class 2606 OID 128408)
-- Name: users users_email_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key87 UNIQUE (email);


--
-- TOC entry 4675 (class 2606 OID 128410)
-- Name: users users_email_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key88 UNIQUE (email);


--
-- TOC entry 4677 (class 2606 OID 128356)
-- Name: users users_email_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key89 UNIQUE (email);


--
-- TOC entry 4679 (class 2606 OID 128392)
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- TOC entry 4681 (class 2606 OID 128364)
-- Name: users users_email_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key90 UNIQUE (email);


--
-- TOC entry 4683 (class 2606 OID 128496)
-- Name: users users_email_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key91 UNIQUE (email);


--
-- TOC entry 4685 (class 2606 OID 128360)
-- Name: users users_email_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key92 UNIQUE (email);


--
-- TOC entry 4687 (class 2606 OID 128380)
-- Name: users users_email_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key93 UNIQUE (email);


--
-- TOC entry 4689 (class 2606 OID 128376)
-- Name: users users_email_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key94 UNIQUE (email);


--
-- TOC entry 4691 (class 2606 OID 128378)
-- Name: users users_email_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key95 UNIQUE (email);


--
-- TOC entry 4693 (class 2606 OID 128290)
-- Name: users users_email_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key96 UNIQUE (email);


--
-- TOC entry 4695 (class 2606 OID 128270)
-- Name: users users_email_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key97 UNIQUE (email);


--
-- TOC entry 4697 (class 2606 OID 128288)
-- Name: users users_email_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key98 UNIQUE (email);


--
-- TOC entry 4699 (class 2606 OID 128284)
-- Name: users users_email_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key99 UNIQUE (email);


--
-- TOC entry 4701 (class 2606 OID 16714)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4321 (class 1259 OID 16513)
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: fusehealth_user
--

CREATE INDEX idx_session_expire ON public.session USING btree (expire);


--
-- TOC entry 5638 (class 2606 OID 125307)
-- Name: BrandSubscription BrandSubscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 5628 (class 2606 OID 124673)
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5629 (class 2606 OID 124678)
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE;


--
-- TOC entry 5621 (class 2606 OID 128596)
-- Name: Order Order_physicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES public."Physician"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5622 (class 2606 OID 124623)
-- Name: Order Order_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5623 (class 2606 OID 124658)
-- Name: Order Order_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."ShippingAddress"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5624 (class 2606 OID 124616)
-- Name: Order Order_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE;


--
-- TOC entry 5625 (class 2606 OID 124648)
-- Name: Order Order_treatmentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES public."TreatmentPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5626 (class 2606 OID 124436)
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 5627 (class 2606 OID 124606)
-- Name: Order Order_userId_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey1" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 5630 (class 2606 OID 124683)
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE;


--
-- TOC entry 5631 (class 2606 OID 124844)
-- Name: Payment Payment_orderId_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey1" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE;


--
-- TOC entry 5612 (class 2606 OID 124145)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5613 (class 2606 OID 124150)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_fkey1" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5614 (class 2606 OID 124160)
-- Name: PrescriptionProducts PrescriptionProducts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5609 (class 2606 OID 128562)
-- Name: Prescription Prescription_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 5620 (class 2606 OID 124232)
-- Name: QuestionOption QuestionOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionOption"
    ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5619 (class 2606 OID 124218)
-- Name: Question Question_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."QuestionnaireStep"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5618 (class 2606 OID 124204)
-- Name: QuestionnaireStep QuestionnaireStep_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionnaireStep"
    ADD CONSTRAINT "QuestionnaireStep_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5617 (class 2606 OID 124190)
-- Name: Questionnaire Questionnaire_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5632 (class 2606 OID 124271)
-- Name: ShippingAddress ShippingAddress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5633 (class 2606 OID 125026)
-- Name: ShippingOrder ShippingOrder_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingOrder"
    ADD CONSTRAINT "ShippingOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5634 (class 2606 OID 125038)
-- Name: ShippingOrder ShippingOrder_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingOrder"
    ADD CONSTRAINT "ShippingOrder_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."ShippingAddress"(id) ON UPDATE CASCADE;


--
-- TOC entry 5635 (class 2606 OID 125049)
-- Name: Subscription Subscription_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5636 (class 2606 OID 125061)
-- Name: Subscription Subscription_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5637 (class 2606 OID 124255)
-- Name: TreatmentPlan TreatmentPlan_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentPlan"
    ADD CONSTRAINT "TreatmentPlan_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5615 (class 2606 OID 124175)
-- Name: TreatmentProducts TreatmentProducts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5616 (class 2606 OID 124180)
-- Name: TreatmentProducts TreatmentProducts_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5610 (class 2606 OID 128572)
-- Name: Treatment Treatment_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE;


--
-- TOC entry 5611 (class 2606 OID 128567)
-- Name: Treatment Treatment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 5608 (class 2606 OID 128552)
-- Name: users users_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5814 (class 0 OID 0)
-- Dependencies: 5813
-- Name: DATABASE fusehealth_database; Type: ACL; Schema: -; Owner: postgres
--

GRANT CONNECT ON DATABASE fusehealth_database TO fusehealth_user;


--
-- TOC entry 5815 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO fusehealth_user;


--
-- TOC entry 2178 (class 826 OID 16480)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO fusehealth_user;


--
-- TOC entry 2177 (class 826 OID 16479)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO fusehealth_user;


-- Completed on 2025-09-25 20:33:29 UTC

--
-- PostgreSQL database dump complete
--

