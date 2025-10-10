--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

-- Started on 2025-10-10 00:38:54 -03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE fusehealth_database;
--
-- TOC entry 7359 (class 1262 OID 50614)
-- Name: fusehealth_database; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE fusehealth_database WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = icu LOCALE = 'en_US.UTF-8' ICU_LOCALE = 'en-US';


ALTER DATABASE fusehealth_database OWNER TO postgres;

\connect fusehealth_database

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 868 (class 1247 OID 50616)
-- Name: enum_BrandSubscriptionPlans_planType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_BrandSubscriptionPlans_planType" AS ENUM (
    'starter',
    'professional',
    'enterprise'
);


ALTER TYPE public."enum_BrandSubscriptionPlans_planType" OWNER TO fusehealth_user;

--
-- TOC entry 871 (class 1247 OID 50624)
-- Name: enum_BrandSubscription_planType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_BrandSubscription_planType" AS ENUM (
    'starter',
    'professional',
    'enterprise'
);


ALTER TYPE public."enum_BrandSubscription_planType" OWNER TO fusehealth_user;

--
-- TOC entry 874 (class 1247 OID 50632)
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
-- TOC entry 877 (class 1247 OID 50646)
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
-- TOC entry 880 (class 1247 OID 50656)
-- Name: enum_FormSectionTemplate_sectionType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_FormSectionTemplate_sectionType" AS ENUM (
    'personalization',
    'account',
    'doctor'
);


ALTER TYPE public."enum_FormSectionTemplate_sectionType" OWNER TO fusehealth_user;

--
-- TOC entry 883 (class 1247 OID 50664)
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
-- TOC entry 886 (class 1247 OID 50674)
-- Name: enum_Order_billingPlan; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Order_billingPlan" AS ENUM (
    'monthly',
    'quarterly',
    'biannual'
);


ALTER TYPE public."enum_Order_billingPlan" OWNER TO fusehealth_user;

--
-- TOC entry 889 (class 1247 OID 50682)
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
-- TOC entry 892 (class 1247 OID 50702)
-- Name: enum_Payment_paymentMethod; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Payment_paymentMethod" AS ENUM (
    'card',
    'bank_transfer',
    'digital_wallet'
);


ALTER TYPE public."enum_Payment_paymentMethod" OWNER TO fusehealth_user;

--
-- TOC entry 895 (class 1247 OID 50710)
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
-- TOC entry 1012 (class 1247 OID 84018)
-- Name: enum_Product_category; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Product_category" AS ENUM (
    'Weight Loss',
    'Hair Growth',
    'Performance',
    'Sexual Health',
    'Skincare',
    'Wellness',
    'Other',
    'weight_loss',
    'hair_growth',
    'performance',
    'sexual_health',
    'skincare',
    'wellness',
    'other'
);


ALTER TYPE public."enum_Product_category" OWNER TO fusehealth_user;

--
-- TOC entry 898 (class 1247 OID 50726)
-- Name: enum_Product_pharmacyProvider; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Product_pharmacyProvider" AS ENUM (
    'absoluterx',
    'truepill',
    'pillpack'
);


ALTER TYPE public."enum_Product_pharmacyProvider" OWNER TO fusehealth_user;

--
-- TOC entry 901 (class 1247 OID 50734)
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
-- TOC entry 904 (class 1247 OID 50758)
-- Name: enum_QuestionnaireStep_category; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_QuestionnaireStep_category" AS ENUM (
    'normal',
    'user_profile',
    'doctor'
);


ALTER TYPE public."enum_QuestionnaireStep_category" OWNER TO fusehealth_user;

--
-- TOC entry 1018 (class 1247 OID 132929)
-- Name: enum_Questionnaire_category; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Questionnaire_category" AS ENUM (
    'weight_loss',
    'hair_growth',
    'performance',
    'sexual_health',
    'skincare',
    'wellness',
    'other'
);


ALTER TYPE public."enum_Questionnaire_category" OWNER TO fusehealth_user;

--
-- TOC entry 1021 (class 1247 OID 152298)
-- Name: enum_Questionnaire_formTemplateType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Questionnaire_formTemplateType" AS ENUM (
    'normal',
    'user_profile',
    'doctor',
    'master_template'
);


ALTER TYPE public."enum_Questionnaire_formTemplateType" OWNER TO fusehealth_user;

--
-- TOC entry 1015 (class 1247 OID 100448)
-- Name: enum_Questionnaire_templateType; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Questionnaire_templateType" AS ENUM (
    'personalization',
    'account',
    'doctor'
);


ALTER TYPE public."enum_Questionnaire_templateType" OWNER TO fusehealth_user;

--
-- TOC entry 907 (class 1247 OID 50766)
-- Name: enum_ShippingOrder_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_ShippingOrder_status" AS ENUM (
    'pending',
    'processing',
    'filled',
    'approved',
    'shipped',
    'delivered',
    'cancelled',
    'rejected',
    'problem',
    'completed'
);


ALTER TYPE public."enum_ShippingOrder_status" OWNER TO fusehealth_user;

--
-- TOC entry 910 (class 1247 OID 50788)
-- Name: enum_Subscription_status; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Subscription_status" AS ENUM (
    'pending',
    'processing',
    'paid',
    'payment_due',
    'cancelled',
    'deleted'
);


ALTER TYPE public."enum_Subscription_status" OWNER TO fusehealth_user;

--
-- TOC entry 913 (class 1247 OID 50802)
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
-- TOC entry 916 (class 1247 OID 50812)
-- Name: enum_Treatment_pharmacyProvider; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_Treatment_pharmacyProvider" AS ENUM (
    'absoluterx',
    'truepill',
    'pillpack'
);


ALTER TYPE public."enum_Treatment_pharmacyProvider" OWNER TO fusehealth_user;

--
-- TOC entry 919 (class 1247 OID 50820)
-- Name: enum_UserPatient_pharmacyProvider; Type: TYPE; Schema: public; Owner: fusehealth_user
--

CREATE TYPE public."enum_UserPatient_pharmacyProvider" AS ENUM (
    'absoluterx',
    'truepill',
    'pillpack'
);


ALTER TYPE public."enum_UserPatient_pharmacyProvider" OWNER TO fusehealth_user;

--
-- TOC entry 922 (class 1247 OID 50828)
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
-- TOC entry 215 (class 1259 OID 50837)
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
    "updatedAt" timestamp with time zone NOT NULL,
    "planCategory" character varying(255),
    "downpaymentAmount" numeric(10,2)
);


ALTER TABLE public."BrandSubscription" OWNER TO fusehealth_user;

--
-- TOC entry 216 (class 1259 OID 50843)
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
-- TOC entry 217 (class 1259 OID 50858)
-- Name: BrandTreatments; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."BrandTreatments" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "userId" uuid NOT NULL,
    "treatmentId" uuid NOT NULL,
    "brandLogo" character varying(255),
    "brandColor" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."BrandTreatments" OWNER TO fusehealth_user;

--
-- TOC entry 218 (class 1259 OID 50863)
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
    "businessType" character varying(100)
);


ALTER TABLE public."Clinic" OWNER TO fusehealth_user;

--
-- TOC entry 219 (class 1259 OID 50870)
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
-- TOC entry 220 (class 1259 OID 50873)
-- Name: FormSectionTemplate; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."FormSectionTemplate" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    name character varying(255) NOT NULL,
    description text,
    "sectionType" public."enum_FormSectionTemplate_sectionType" NOT NULL,
    category character varying(255),
    "treatmentId" uuid,
    schema jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "publishedAt" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isGlobal" boolean DEFAULT false NOT NULL,
    "tenantId" uuid
);


ALTER TABLE public."FormSectionTemplate" OWNER TO fusehealth_user;

--
-- TOC entry 221 (class 1259 OID 50880)
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
    "physicianId" uuid,
    "mdCaseId" character varying(255)
);


ALTER TABLE public."Order" OWNER TO fusehealth_user;

--
-- TOC entry 222 (class 1259 OID 50889)
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
-- TOC entry 223 (class 1259 OID 50894)
-- Name: Payment; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Payment" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderId" uuid,
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
    "updatedAt" timestamp with time zone NOT NULL,
    "brandSubscriptionId" uuid
);


ALTER TABLE public."Payment" OWNER TO fusehealth_user;

--
-- TOC entry 224 (class 1259 OID 50902)
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
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mdPhysicianId" character varying(255)
);


ALTER TABLE public."Physician" OWNER TO fusehealth_user;

--
-- TOC entry 225 (class 1259 OID 50908)
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
-- TOC entry 226 (class 1259 OID 50911)
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
-- TOC entry 227 (class 1259 OID 50914)
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
    "imageUrl" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pharmacyProductId" character varying(255),
    "pharmacyProvider" public."enum_Product_pharmacyProvider" DEFAULT 'absoluterx'::public."enum_Product_pharmacyProvider" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "pharmacyWholesaleCost" numeric(10,2),
    "medicationSize" character varying(255),
    category public."enum_Product_category",
    "requiredDoctorQuestions" jsonb DEFAULT '[]'::jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "suggestedRetailPrice" numeric(10,2),
    "pharmacyVendor" character varying(255),
    "pharmacyApiConfig" jsonb,
    slug character varying(255)
);


ALTER TABLE public."Product" OWNER TO fusehealth_user;

--
-- TOC entry 228 (class 1259 OID 50921)
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
-- TOC entry 229 (class 1259 OID 50928)
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
-- TOC entry 230 (class 1259 OID 50933)
-- Name: Questionnaire; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."Questionnaire" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    title character varying(255) NOT NULL,
    description text,
    "treatmentId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "checkoutStepPosition" integer DEFAULT '-1'::integer NOT NULL,
    "userId" uuid,
    "isTemplate" boolean DEFAULT false NOT NULL,
    color character varying(255),
    "productId" uuid,
    "personalizationQuestionsSetup" boolean DEFAULT false NOT NULL,
    "createAccountQuestionsSetup" boolean DEFAULT false NOT NULL,
    "doctorQuestionsSetup" boolean DEFAULT false NOT NULL,
    "formTemplateType" public."enum_Questionnaire_formTemplateType",
    category public."enum_Questionnaire_category"
);


ALTER TABLE public."Questionnaire" OWNER TO fusehealth_user;

--
-- TOC entry 231 (class 1259 OID 50940)
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
    "updatedAt" timestamp with time zone NOT NULL,
    category public."enum_QuestionnaireStep_category" DEFAULT 'normal'::public."enum_QuestionnaireStep_category" NOT NULL
);


ALTER TABLE public."QuestionnaireStep" OWNER TO fusehealth_user;

--
-- TOC entry 232 (class 1259 OID 50946)
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO fusehealth_user;

--
-- TOC entry 233 (class 1259 OID 50949)
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
-- TOC entry 234 (class 1259 OID 50956)
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
-- TOC entry 235 (class 1259 OID 50960)
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
-- TOC entry 236 (class 1259 OID 50964)
-- Name: TenantProduct; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."TenantProduct" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "clinicId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "questionnaireId" uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TenantProduct" OWNER TO fusehealth_user;

--
-- TOC entry 237 (class 1259 OID 50968)
-- Name: TenantProductForms; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."TenantProductForms" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "tenantId" uuid NOT NULL,
    "treatmentId" uuid,
    "layoutTemplate" character varying(255) DEFAULT 'layout_a'::character varying,
    "themeId" character varying(255),
    "lockedUntil" timestamp with time zone,
    "publishedUrl" character varying(255),
    "lastPublishedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "productId" uuid,
    "questionnaireId" uuid,
    "clinicId" uuid
);


ALTER TABLE public."TenantProductForms" OWNER TO fusehealth_user;

--
-- TOC entry 238 (class 1259 OID 50974)
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
    "productsPrice" double precision DEFAULT '0'::double precision NOT NULL,
    active boolean DEFAULT false NOT NULL,
    "stripeProductId" character varying(255),
    "mdCaseId" character varying(255),
    slug character varying(255),
    "pharmacyProvider" public."enum_Treatment_pharmacyProvider" DEFAULT 'absoluterx'::public."enum_Treatment_pharmacyProvider" NOT NULL,
    category character varying(255)
);


ALTER TABLE public."Treatment" OWNER TO fusehealth_user;

--
-- TOC entry 239 (class 1259 OID 50982)
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
-- TOC entry 240 (class 1259 OID 50990)
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
-- TOC entry 241 (class 1259 OID 50993)
-- Name: UserPatient; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public."UserPatient" (
    "userId" uuid NOT NULL,
    "pharmacyProvider" public."enum_UserPatient_pharmacyProvider" NOT NULL,
    "pharmacyPatientId" character varying(255) NOT NULL,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."UserPatient" OWNER TO fusehealth_user;

--
-- TOC entry 242 (class 1259 OID 50998)
-- Name: session; Type: TABLE; Schema: public; Owner: fusehealth_user
--

CREATE TABLE public.session (
    sid character varying(255) NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp with time zone NOT NULL
);


ALTER TABLE public.session OWNER TO fusehealth_user;

--
-- TOC entry 243 (class 1259 OID 51003)
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
    "activationTokenExpiresAt" timestamp with time zone,
    "mdPatientId" character varying(255),
    "newMessages" boolean DEFAULT false,
    "businessType" character varying(100),
    website character varying(255),
    "selectedPlanCategory" character varying(100),
    "selectedPlanType" character varying(100),
    "selectedPlanName" character varying(255),
    "selectedPlanPrice" numeric(10,2),
    "selectedDownpaymentType" character varying(100),
    "selectedDownpaymentName" character varying(255),
    "selectedDownpaymentPrice" numeric(10,2),
    "planSelectionTimestamp" timestamp with time zone
);


ALTER TABLE public.users OWNER TO fusehealth_user;

--
-- TOC entry 7325 (class 0 OID 50837)
-- Dependencies: 215
-- Data for Name: BrandSubscription; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."BrandSubscription" (id, "deletedAt", "userId", "planType", status, "stripeSubscriptionId", "stripeCustomerId", "stripePriceId", "monthlyPrice", "currentPeriodStart", "currentPeriodEnd", "cancelledAt", "paymentDue", "trialStart", "trialEnd", features, "createdAt", "updatedAt", "planCategory", "downpaymentAmount") FROM stdin;
da2ca545-6472-45c2-b457-45337001a7ce	\N	1f8acc57-f137-4b51-ad44-cad317ba43cf	standard	active	sub_1SGPPQELzhgYQXTRoEhfoTEB	cus_T9px09A59xFiZf	price_1SG0UqELzhgYQXTR0NsiRdxW	3500.00	2025-10-09 16:21:52-03	2025-11-09 16:21:51-03	\N	\N	\N	\N	{"apiAccess": true, "whiteLabel": false, "maxProducts": 20, "maxCampaigns": 20, "customBranding": true, "analyticsAccess": true, "customerSupport": "priority", "customIntegrations": false}	2025-10-09 16:20:40.39-03	2025-10-09 16:21:52.556-03	\N	\N
\.


--
-- TOC entry 7326 (class 0 OID 50843)
-- Dependencies: 216
-- Data for Name: BrandSubscriptionPlans; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."BrandSubscriptionPlans" (id, "deletedAt", "planType", name, description, "monthlyPrice", "stripePriceId", "maxProducts", "maxCampaigns", "analyticsAccess", "customerSupport", "customBranding", "apiAccess", "whiteLabel", "customIntegrations", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
58c745ed-3e03-4893-a694-ce05069e4bed	\N	standard_build	Standard Build	Ideal for wellness, aesthetics, weight-loss, and lifestyle telehealth brands that don't require controlled scripts.	3000.00	price_1SAjV0ELzhgYQXTR6V1Dq6wB	50	5	t	email	f	f	f	f	f	1	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
89d2f746-f978-4b3b-82bf-3ce4de816faf	\N	enterprise	Enterprise	Full-featured solution for large organizations	499.00	price_1SAjVSELzhgYQXTRCprM1gJc	-1	-1	t	dedicated	t	t	t	t	f	3	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
9583b423-b875-4b13-9444-0118c15b5111	\N	downpayment_professional	Discounted Professional First Month	This is the upfront price we charge for all professional plans.	2500.00	price_1SBq2CELzhgYQXTRpmjBu7nS	200	20	t	priority	t	t	f	f	f	4	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
9583b423-b875-4b13-9444-0118c15b5223	\N	downpayment_standard	Discounted First Month	This is the upfront price we charge for all standard plans.	1500.00	price_1SBmgEELzhgYQXTRV5aIJUL5	200	20	t	priority	t	t	f	f	f	4	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
9583b423-b875-4b13-9444-0118c15b5267	\N	high-definition	High Definition	Ideal for growing brands with advanced needs	5000.00	price_1SBiEyELzhgYQXTRtvylfQXs	200	20	t	priority	t	t	f	f	f	2	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
9583b423-b875-4b13-9444-0118c15b5261	\N	entry	Entry	Perfect for startups or small med spas ready to go online. Set up to 3 products instantly with Fuse's compliant infrastructure and built-in templates.	1500.00	price_1SBmgEELzhgYQXTRV5aIJUL5	3	20	t	priority	t	t	f	f	t	1	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
9583b423-b875-4b13-9444-0118c15b5262	\N	standard	Standard	Designed for growing practices that want more control. Includes everything in Entry, plus custom-branded forms and enhanced setup support.	3500.00	price_1SG0UqELzhgYQXTR0NsiRdxW	20	20	t	priority	t	t	f	f	t	2	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
9583b423-b875-4b13-9444-0118c15b5263	\N	premium	Premium	Built for established brands expanding nationwide. Get a custom website, unlimited products, and full-service implementation from our team.	10000.00	price_1SG0VlELzhgYQXTR4kEEwjU5	-1	20	t	priority	t	t	f	f	t	3	2025-09-24 01:17:04.808575-03	2025-09-24 01:17:04.808575-03
\.


--
-- TOC entry 7327 (class 0 OID 50858)
-- Dependencies: 217
-- Data for Name: BrandTreatments; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."BrandTreatments" (id, "deletedAt", "userId", "treatmentId", "brandLogo", "brandColor", "createdAt", "updatedAt") FROM stdin;
f8b27263-c17d-4c16-9f3a-aa9651959c04	\N	1f8acc57-f137-4b51-ad44-cad317ba43cf	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	\N	2025-09-30 23:10:58.824-03	2025-09-30 23:10:58.824-03
c65f6906-476e-4607-9a9b-2b4810a1eb69	\N	7c6f0539-e04d-4f6f-a693-f2b34bb386fd	0bc5e6fa-360f-412c-8d11-34910ee05fe0	\N	\N	2025-10-02 15:56:24.544-03	2025-10-02 15:56:24.544-03
\.


--
-- TOC entry 7328 (class 0 OID 50863)
-- Dependencies: 218
-- Data for Name: Clinic; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Clinic" (id, "deletedAt", slug, logo, name, "createdAt", "updatedAt", active, status, "businessType") FROM stdin;
0d0f12ea-fdc5-4227-a0b9-b3e5b24d0b48	\N	limit		Limit	2025-09-16 01:09:54.01-03	2025-09-16 01:09:54.01-03	f	pending	\N
29e3985c-20cd-45a8-adf7-d6f4cdd21a15	\N	limit-1		Limit	2025-09-16 01:11:02.255-03	2025-09-16 01:11:02.255-03	f	pending	\N
6cef6794-7acb-4529-bb41-cef46849120b	\N	test-clinic-2		Test Clinic 2	2025-09-25 15:01:26.565-03	2025-09-25 15:01:26.565-03	f	pending	\N
c7d2c458-d3e4-41e1-b620-f05c338e7efc	\N	acme		Acme	2025-09-25 15:10:41.527-03	2025-09-25 15:10:41.527-03	f	pending	\N
9feac14b-0aa1-48d5-bb32-14ba1f36d9bd	\N	test-brand		Test Brand	2025-09-29 15:58:47.249-03	2025-09-29 15:58:47.249-03	f	pending	\N
2be7b60e-37d6-4398-b89c-808a5bac5a40	\N	preimier		Preimier	2025-10-02 15:54:21.372-03	2025-10-02 15:54:21.372-03	f	pending	wellness
6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	limitless	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1759540385376-logo-flower.jpg	Limitless Health	2025-09-12 00:04:52.636-03	2025-10-03 22:13:08.855-03	f	pending	\N
\.


--
-- TOC entry 7329 (class 0 OID 50870)
-- Dependencies: 219
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Entity" (id, "deletedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 7330 (class 0 OID 50873)
-- Dependencies: 220
-- Data for Name: FormSectionTemplate; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."FormSectionTemplate" (id, "deletedAt", name, description, "sectionType", category, "treatmentId", schema, version, "publishedAt", "isActive", "createdAt", "updatedAt", "isGlobal", "tenantId") FROM stdin;
29ee33b1-57ac-44bc-b035-40d845e59ae4	\N	Weight Loss Personalization Questions	Category-specific personalization questions for Weight Loss products	personalization	weight_loss	\N	{"steps": [{"id": "step-1759887334849", "title": "Cool Question", "category": "normal", "stepType": "question", "questions": [{"id": "q-1759887334849", "type": "single-choice", "options": ["Cool Question Answer 1", "Cool Question Answer 2", "Cool Question Answer 3", "Cool Question Answer 4"], "required": true, "questionText": ""}], "stepOrder": 1, "description": "Cool Question Description"}]}	2	\N	t	2025-10-07 22:31:05.033-03	2025-10-07 22:36:16.902-03	t	\N
\.


--
-- TOC entry 7331 (class 0 OID 50880)
-- Dependencies: 221
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Order" (id, "deletedAt", "orderNumber", "userId", "treatmentId", "questionnaireId", status, "subtotalAmount", "discountAmount", "taxAmount", "shippingAmount", "totalAmount", notes, "questionnaireAnswers", "shippedAt", "deliveredAt", "createdAt", "updatedAt", "treatmentPlanId", "billingInterval", "paymentIntentId", "shippingAddressId", "physicianId", "mdCaseId") FROM stdin;
fb1ccfe5-657d-4320-912c-4076c4905a40	\N	ORD-1757996649126-GX9NIB	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	2000.00	0.00	0.00	0.00	2000.00	\N	{}	\N	\N	2025-09-16 01:24:09.128-03	2025-09-16 01:24:09.128-03	\N	\N	\N	\N	\N	\N
ce858a6f-662b-43a5-abfb-81e2412cb372	\N	ORD-1757997157841-L6SH5U	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	1300.00	0.00	0.00	0.00	1300.00	\N	{}	\N	\N	2025-09-16 01:32:37.841-03	2025-09-16 01:32:37.841-03	\N	\N	\N	\N	\N	\N
c451ffec-5618-47e8-a849-b5aee9def1db	\N	ORD-1757997545952-4VI19A	63ab9a4a-ddd0-492b-9912-c7a731df19f4	724eb0c4-54a3-447c-8814-de4c1060e77a	\N	pending	350.00	0.00	0.00	0.00	350.00	\N	{}	\N	\N	2025-09-16 01:39:05.952-03	2025-09-16 01:39:05.952-03	\N	\N	\N	\N	\N	\N
605c2882-2432-4e31-9c19-2c09eded4ebe	\N	ORD-1757998375524-T02VIR	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	2100.00	0.00	0.00	0.00	2100.00	\N	{}	\N	\N	2025-09-16 01:52:55.524-03	2025-09-16 01:52:55.524-03	\N	\N	\N	\N	\N	\N
67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	\N	ORD-1757999721881-11PO6N	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	900.00	0.00	0.00	0.00	900.00	\N	{}	\N	\N	2025-09-16 02:15:21.882-03	2025-09-16 02:15:21.882-03	\N	\N	\N	\N	\N	\N
22659bdc-ce0d-4ee7-bf69-869fd119d0c2	\N	ORD-1758069422751-XN63AZ	63ab9a4a-ddd0-492b-9912-c7a731df19f4	724eb0c4-54a3-447c-8814-de4c1060e77a	\N	pending	79.00	0.00	0.00	0.00	79.00	\N	{}	\N	\N	2025-09-16 21:37:02.751-03	2025-09-16 21:37:02.751-03	\N	\N	\N	\N	\N	\N
d1526926-5dd0-4cc4-87e1-d060a312dc3a	\N	ORD-1758260172037-LJON4P	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	299.00	0.00	0.00	0.00	299.00	\N	{}	\N	\N	2025-09-19 02:36:12.039-03	2025-09-19 02:36:12.039-03	\N	\N	\N	\N	\N	\N
32f70bf9-e1a1-4258-945d-791d5b469c3e	\N	ORD-1758263238607-FLOPLM	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	698.00	0.00	0.00	0.00	698.00	\N	{}	\N	\N	2025-09-19 03:27:18.607-03	2025-09-19 03:27:18.607-03	\N	\N	\N	\N	\N	\N
6c8a6827-cf48-4b7b-824d-4a90dd75661e	\N	ORD-1758313924593-YG4UWE	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 17:32:04.595-03	2025-09-19 17:32:04.595-03	\N	\N	\N	\N	\N	\N
bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	\N	ORD-1758314273723-QS12OM	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 17:37:53.724-03	2025-09-19 17:37:53.724-03	\N	\N	\N	\N	\N	\N
22b01915-6732-44f0-84ca-5c276ad102b5	\N	ORD-1758314710702-MLYAK6	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 17:45:10.703-03	2025-09-19 17:45:10.703-03	\N	\N	\N	\N	\N	\N
4df9af65-b91d-46cc-b119-6d02b5b52126	\N	ORD-1758315049588-AGWKSR	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 17:50:49.588-03	2025-09-19 17:50:49.588-03	\N	\N	\N	\N	\N	\N
bc2797de-d533-453b-ae07-1e2c5de49957	\N	ORD-1758315163075-FWCUCN	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 17:52:43.076-03	2025-09-19 17:52:43.076-03	\N	\N	\N	\N	\N	\N
c19416b1-13c1-48f4-a6bd-2a0742c76e8d	\N	ORD-1758329145788-651LE2	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 21:45:45.788-03	2025-09-19 21:45:45.788-03	\N	\N	\N	\N	\N	\N
03665e11-33aa-42f0-8371-12eed398603c	\N	ORD-1758329312385-J5F35O	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 21:48:32.386-03	2025-09-19 21:48:32.386-03	\N	\N	\N	\N	\N	\N
20da32f3-5bd8-45e3-a637-c65054251d18	\N	ORD-1758329542373-KFX71F	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 21:52:22.374-03	2025-09-19 21:52:22.374-03	\N	\N	\N	\N	\N	\N
f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	\N	ORD-1758330972014-ZD37XV	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 22:16:12.015-03	2025-09-19 22:16:12.015-03	\N	\N	\N	\N	\N	\N
621e348f-d5ee-418d-947c-8e7e552059f2	\N	ORD-1758330982167-61IM3Z	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 22:16:22.168-03	2025-09-19 22:16:22.168-03	\N	\N	\N	\N	\N	\N
4d8b5d5b-39a5-4f70-823b-064b08108388	\N	ORD-1758331564655-ZL5SWZ	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 22:26:04.656-03	2025-09-19 22:26:04.656-03	\N	\N	\N	\N	\N	\N
ec39a570-883f-4ee4-a466-e62d696c7256	\N	ORD-1758331742160-4EYAAX	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 22:29:02.162-03	2025-09-19 22:29:02.162-03	\N	\N	\N	\N	\N	\N
5ab11918-f299-45f9-8973-84ee7294cffb	\N	ORD-1758332094132-W93UJL	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 22:34:54.135-03	2025-09-19 22:34:54.135-03	\N	\N	\N	\N	\N	\N
34dde290-1467-4d40-a293-75b17bf7fcda	\N	ORD-1758332559191-8FSGCG	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-19 22:42:39.193-03	2025-09-19 22:42:39.193-03	\N	\N	\N	\N	\N	\N
e6a642c9-d543-407b-a74d-69b6f5e926f7	\N	ORD-1758340738411-P0X4W9	9bc80814-7c2d-4624-9000-72b38a03c6fd	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 00:58:58.411-03	2025-09-20 00:58:58.411-03	\N	\N	\N	\N	\N	\N
4c40d1e6-c624-4fdd-864c-716c006618d6	\N	ORD-1758341434226-CQGXN0	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:10:34.229-03	2025-09-20 01:10:34.229-03	\N	\N	\N	\N	\N	\N
d5632389-ae5f-4cb2-b02c-a52ed736033e	\N	ORD-1758341593568-RB541I	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:13:13.568-03	2025-09-20 01:13:13.568-03	\N	\N	\N	\N	\N	\N
9fdba450-da30-4623-b444-d209dcac9287	\N	ORD-1758341603529-T0AKCA	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:13:23.53-03	2025-09-20 01:13:23.53-03	\N	\N	\N	\N	\N	\N
a1719265-616b-4c45-96db-7cc251157458	\N	ORD-1758341634209-YCIONC	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:13:54.209-03	2025-09-20 01:13:54.209-03	\N	\N	\N	\N	\N	\N
33111ce2-f5b2-4478-a4ef-de03ac8fbe32	\N	ORD-1758341653261-KRPJ5B	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:14:13.262-03	2025-09-20 01:14:13.262-03	\N	\N	\N	\N	\N	\N
1ea76be3-2cf1-42cf-b483-f058d053b2c4	\N	ORD-1758341800805-7EWFOC	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:16:40.806-03	2025-09-20 01:16:40.806-03	\N	\N	\N	\N	\N	\N
59ec0ef5-5817-4d10-83ce-9f1b230d2322	\N	ORD-1758341809993-TS221N	75fa14f5-b923-436d-aae7-436b3055375e	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:16:49.993-03	2025-09-20 01:16:49.993-03	\N	\N	\N	\N	\N	\N
d2333798-adce-4b61-a3f8-ca47443a7560	\N	ORD-1758343678354-QZYNTB	2b6a9d71-a7be-4216-8d3e-c23aeb1ef9e4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:47:58.355-03	2025-09-20 01:47:58.355-03	\N	\N	\N	\N	\N	\N
ee463fba-2ff1-41db-8d06-9216804ebe4d	\N	ORD-1758343994678-Z9UF7N	036a4efd-f65a-47f5-958e-04d3cdbee596	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:53:14.678-03	2025-09-20 01:53:14.678-03	\N	\N	\N	\N	\N	\N
306613e2-8ca8-4270-a636-14ec5ff186bd	\N	ORD-1758344005887-IYVQNJ	036a4efd-f65a-47f5-958e-04d3cdbee596	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:53:25.887-03	2025-09-20 01:53:25.887-03	\N	\N	\N	\N	\N	\N
0e0a1874-8c35-4561-a5a7-c7199da57a56	\N	ORD-1758344061260-DTMM7Y	036a4efd-f65a-47f5-958e-04d3cdbee596	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 01:54:21.261-03	2025-09-20 01:54:21.261-03	\N	\N	\N	\N	\N	\N
0fcd8594-693c-431d-bfa2-a044619f7981	\N	ORD-1758344445957-4IPOE9	15d13138-9f32-4358-92d8-600d9c6fe558	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 02:00:45.957-03	2025-09-20 02:00:45.957-03	\N	\N	\N	\N	\N	\N
625276f3-24e2-49d6-8a2a-5c35ef494128	\N	ORD-1758344655942-WDY1TO	df8f4c32-b6ba-4efd-af34-afcc6272a945	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	\N	2025-09-20 02:04:15.942-03	2025-09-20 02:04:15.942-03	\N	\N	\N	\N	\N	\N
f6564040-0bba-41d2-be04-c38cc51dfc40	\N	ORD-1758346876556-7OKUFF	89b0ef70-7516-4fad-ac4a-37ac74815031	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	{"Last Name": "Cena8", "First Name": "John", "Email Address": "john.cena8@gmail.com", "Mobile Number": "314135135", "Goal Weight (pounds)": "111", "What dose were you on?": "1mg weekly", "What state do you live in?": "Alabama", "What's your date of birth?": "4111-04-01", "When did you last take it?": "2 months ago", "What's your gender at birth?": "Male", "Which medication WERE YOU LAST ON?": "Semaglutide (Ozempic, Wegovy)", "Did you experience any side effects?": "No", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "Yes, I take medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "Yes, I have taken weight loss medications before.", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "Gastroparesis (Paralysis of your intestines),None of the above", "Please list all medications, vitamins, and supplements": "med 1, med 2", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-20 02:41:16.557-03	2025-09-20 02:41:16.557-03	\N	\N	\N	\N	\N	\N
e8656871-3d0c-4afd-9751-cfc12d7d0b33	\N	ORD-1758347274345-886QC3	2551f7cc-8c84-48da-bec3-fde2b39bc3cb	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	{"Last Name": "Cena9", "First Name": "John", "Email Address": "john.cena9@gmail.com", "Mobile Number": "2133134444", "Goal Weight (pounds)": "111", "What dose were you on?": "1mg weekly", "What state do you live in?": "Alabama", "What's your date of birth?": "1988-12-07", "When did you last take it?": "2 months", "What's your gender at birth?": "Male", "Which medication WERE YOU LAST ON?": "Liraglutide (Saxenda, Victoza)", "Did you experience any side effects?": "No", "Have you tried losing weight before?": "No, this is my first time actively trying to lose weight.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "Yes, I take medications", "Do you have any of these medical conditions?": "Hypertension,High cholesterol or triglycerides", "Have you taken weight loss medications before?": "Yes, I have taken weight loss medications before.", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "Gastroparesis (Paralysis of your intestines),Triglycerides over 600 at any point", "Please list all medications, vitamins, and supplements": "med1,med2", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-20 02:47:54.345-03	2025-09-20 02:47:54.345-03	\N	\N	\N	\N	\N	\N
07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	\N	ORD-1758592039773-O5L8IN	0007334a-e487-43a7-971b-5c4c8d2950fa	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	0.00	0.00	0.00	0.00	0.00	\N	{"Last Name": "Cena11", "First Name": "John", "Email Address": "john.cena11@gmail.com", "Mobile Number": "135135135", "Goal Weight (pounds)": "111", "What dose were you on?": "1mg weekly", "What state do you live in?": "Alabama", "What's your date of birth?": "1998-12-04", "When did you last take it?": "2 months ago", "What's your gender at birth?": "Male", "Which medication WERE YOU LAST ON?": "Semaglutide (Ozempic, Wegovy)", "Did you experience any side effects?": "No", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "Yes, I have taken weight loss medications before.", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-22 22:47:19.773-03	2025-09-22 22:47:19.773-03	00e000db-2f7b-405f-85a1-d72148dda001	biannual	\N	286c59e3-6e64-4acf-bdac-e71e045d54d5	\N	\N
dbf880d4-b04f-4684-81a7-e461661d7599	\N	ORD-1758593129774-AQYBZT	8f59fb0a-ca8b-4e82-9104-eeea4e727f39	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	249.00	0.00	0.00	0.00	249.00	\N	{"Last Name": "Cena12", "First Name": "John", "Email Address": "john.cena12@gmail.com", "Mobile Number": "34135135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "9888-12-02", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-22 23:05:29.774-03	2025-09-22 23:05:30.988-03	00e000db-2f7b-405f-85a1-d72148dda001	biannual	pi_3SALbiELzhgYQXTR1kp2BWt3	7a859b38-9664-41b1-860e-fc34e49a87b2	\N	\N
114c15ad-7dfa-49f9-8e88-381c46bf7f9b	\N	ORD-1758593455701-7H8GB6	b89d92d0-dc03-487b-a246-a341ec5d1f37	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	249.00	0.00	0.00	0.00	249.00	\N	{"Last Name": "Cena13", "First Name": "John", "Email Address": "john.cena13@gmail.com", "Mobile Number": "31413513513", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "2222-02-22", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "Insulin,None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-22 23:10:55.701-03	2025-09-22 23:10:56.943-03	00e000db-2f7b-405f-85a1-d72148dda001	biannual	pi_3SALgyELzhgYQXTR0h3sgTWd	e817cd77-9886-4247-9b61-5336c5f7ff3d	\N	\N
8e64840e-be77-4470-8ba0-ea18fcbf0eaa	\N	ORD-1758593659918-RVOF1Y	b89d92d0-dc03-487b-a246-a341ec5d1f37	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	249.00	0.00	0.00	0.00	249.00	\N	{"Last Name": "Cena13", "First Name": "Joun", "Email Address": "john.cena13@gmail.com", "Mobile Number": "134135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "2222-02-02", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-22 23:14:19.919-03	2025-09-22 23:14:21.621-03	00e000db-2f7b-405f-85a1-d72148dda001	biannual	pi_3SALkHELzhgYQXTR1h17D9Ud	b34d7a27-b518-4bcc-930d-7a6ebfbfe089	\N	\N
0e4001c7-4de0-47d9-a041-72d26a5f1c51	\N	ORD-1758594848325-YBW6G4	6b028641-7fb2-47bb-9fca-fedb3ea2ecd7	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "Cena14", "First Name": "John", "Email Address": "john.cena14@gmail.com", "Mobile Number": "135135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "1988-07-14", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-22 23:34:08.325-03	2025-09-22 23:34:08.612-03	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SAM3QELzhgYQXTR1i2I1BMw	e0805c5d-32e4-4f14-a635-918490036ead	\N	\N
38264b46-354b-470f-adaa-a05336cc3637	\N	ORD-1758740070972-VVVW56	3b2cadbc-829e-4efd-b0f4-0a4e97c73ebb	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "Cena15", "First Name": "John", "Email Address": "john.cena15@gmail.com", "Mobile Number": "31135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "4111-04-03", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-24 15:54:30.972-03	2025-09-24 15:54:32.279-03	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SAxpkELzhgYQXTR1wKXRlCP	a2539844-289c-44bd-bf2a-76f8e42ce9e5	\N	\N
5dec4e20-4cb0-40be-8977-c0e9adefa1d9	\N	ORD-1758746236515-P2THX9	95214474-1920-4524-a513-2325edeb73dc	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "Cena20", "First Name": "John", "Email Address": "john.cena20@gmail.com", "Mobile Number": "31413513", "Goal Weight (pounds)": "111", "What state do you live in?": "Alabama", "What's your date of birth?": "13413-04-13", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "Insulin", "What is the main difficulty you face when trying to lose weight?": "Dealing with hunger/cravings"}	\N	\N	2025-09-24 17:37:16.515-03	2025-09-24 17:37:17.686-03	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SAzRBELzhgYQXTR01so3lKu	30cbc304-7ce4-42b4-8f8b-286cf8cba3b4	\N	\N
8d8ff20f-8b71-4f49-9411-b1e014cad063	\N	ORD-1758851080245-OUY9AG	ab53f6ca-471c-42cb-b421-953142ac08ef	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	269.00	0.00	0.00	0.00	269.00	\N	{"Last Name": "adfa", "First Name": "Jdaf", "Email Address": "adfadf@gmail.com", "Mobile Number": "135135135", "Goal Weight (pounds)": "200", "What state do you live in?": "Alabama", "What's your date of birth?": "4134-12-13", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "Not knowing what to eat"}	\N	\N	2025-09-25 22:44:40.246-03	2025-09-25 22:44:41.468-03	d975cc52-4628-4981-bcde-de741823fce8	quarterly	pi_3SBQiDELzhgYQXTR0cSqhhyv	688fc6e2-8020-4e59-9591-288f84a33872	\N	\N
867746fd-3653-4b86-bc6f-bf1f1d8785f3	\N	ORD-1758853038828-4EY5SJ	4edbbd82-9bb1-401d-bd9b-ab4565e3eeee	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	cancelled	199.00	0.00	0.00	0.00	199.00	\N	{"Last Name": "134134", "First Name": "134", "Email Address": "edaf@gadg.com", "Mobile Number": "134135135", "Goal Weight (pounds)": "111", "What state do you live in?": "Alaska", "What's your date of birth?": "0111-11-11", "What's your gender at birth?": "Male", "Have you tried losing weight before?": "Yes, I have tried diets, exercises, or other methods.", "Are you allergic to any of the following?": "None of the above", "Are you currently taking any medications?": "No, I don't take any medications", "Do you have any of these medical conditions?": "None of the above", "Have you taken weight loss medications before?": "No, I haven't taken weight loss medications", "What is your main goal with weight loss medication?": "Improve health", "Do you have any of these serious medical conditions?": "None of the above", "Are you currently taking any of the following medications?": "None of the above", "What is the main difficulty you face when trying to lose weight?": "It was taking too long"}	\N	\N	2025-09-25 23:17:18.828-03	2025-10-02 23:17:30.424-03	96158ea4-d760-47f0-9b45-f119ffe7d23f	monthly	pi_3SBRDoELzhgYQXTR1OYuNMup	7002e70f-d733-493d-a822-68111a245ffa	\N	\N
\.


--
-- TOC entry 7332 (class 0 OID 50889)
-- Dependencies: 222
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."OrderItem" (id, "deletedAt", "orderId", "productId", quantity, "unitPrice", "totalPrice", dosage, notes, "createdAt", "updatedAt", "pharmacyProductId") FROM stdin;
9b8e1c9e-a548-4bb6-8e29-085478440f61	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 01:24:09.33-03	2025-09-16 01:24:09.33-03	\N
6a7ada85-aaf6-4760-9239-6f62ff792114	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	550e8400-e29b-41d4-a716-446655440102	1	1100.00	1100.00	2.4 mg subcutaneous injection weekly	\N	2025-09-16 01:24:09.512-03	2025-09-16 01:24:09.512-03	\N
4452daf2-b63d-43f2-816b-1d58fb9b7e4a	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	550e8400-e29b-41d4-a716-446655440105	1	450.00	450.00	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	\N	2025-09-16 01:32:37.85-03	2025-09-16 01:32:37.85-03	\N
77f848a8-e0cc-4c33-8ba5-277aff24fd1f	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	550e8400-e29b-41d4-a716-446655440104	1	850.00	850.00	3 mg subcutaneous injection daily	\N	2025-09-16 01:32:37.853-03	2025-09-16 01:32:37.853-03	\N
0a12e6de-3940-4086-b835-c5aaffeabf1b	\N	c451ffec-5618-47e8-a849-b5aee9def1db	550e8400-e29b-41d4-a716-446655440001	1	350.00	350.00	500 mg per infusion	\N	2025-09-16 01:39:05.956-03	2025-09-16 01:39:05.956-03	\N
08e26fb7-2639-4f0f-907a-bf4195203796	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 01:52:55.532-03	2025-09-16 01:52:55.532-03	\N
50ca993b-3e34-431d-81d9-8a526e74c823	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	550e8400-e29b-41d4-a716-446655440103	1	1200.00	1200.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-16 01:52:55.536-03	2025-09-16 01:52:55.536-03	\N
9d40c33a-7b26-4411-8861-d34567d25253	\N	67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 02:15:22.072-03	2025-09-16 02:15:22.072-03	\N
c70d12e2-86e0-48b8-ae4e-0334b6a37351	\N	22659bdc-ce0d-4ee7-bf69-869fd119d0c2	550e8400-e29b-41d4-a716-446655440002	1	79.00	79.00	300 mg daily	\N	2025-09-16 21:37:02.759-03	2025-09-16 21:37:02.759-03	\N
d0ed16c1-eaed-425d-98aa-ad855e5301c7	\N	d1526926-5dd0-4cc4-87e1-d060a312dc3a	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 02:36:12.243-03	2025-09-19 02:36:12.243-03	\N
13097291-b4ee-4581-bed3-0f4c191badf2	\N	32f70bf9-e1a1-4258-945d-791d5b469c3e	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 03:27:18.62-03	2025-09-19 03:27:18.62-03	\N
699ff119-3f99-41b4-bab2-b1b32d463823	\N	32f70bf9-e1a1-4258-945d-791d5b469c3e	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 03:27:18.624-03	2025-09-19 03:27:18.624-03	\N
7a1e99e3-a843-49e3-965a-e624b7745db6	\N	6c8a6827-cf48-4b7b-824d-4a90dd75661e	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 17:32:04.818-03	2025-09-19 17:32:04.818-03	\N
8372bb43-10f8-4f39-9cb5-e478af475066	\N	6c8a6827-cf48-4b7b-824d-4a90dd75661e	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 17:32:05.007-03	2025-09-19 17:32:05.007-03	\N
5dce3cbf-82f1-4f05-853f-9be40da9d121	\N	6c8a6827-cf48-4b7b-824d-4a90dd75661e	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 17:32:05.199-03	2025-09-19 17:32:05.199-03	\N
e69e74dc-c437-4940-a951-dc12a4ed6ce4	\N	bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 17:37:53.915-03	2025-09-19 17:37:53.915-03	\N
053102f0-5724-4029-ada2-e96535dd8861	\N	bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 17:37:54.1-03	2025-09-19 17:37:54.1-03	\N
e802e838-28c9-4858-bc4d-d0ba7d9cf08c	\N	bd40cdbe-c7b7-4910-9ce5-a2d0280f8ba3	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 17:37:54.298-03	2025-09-19 17:37:54.298-03	\N
2437f1c5-45b9-44eb-bca2-e26bdc9688ae	\N	22b01915-6732-44f0-84ca-5c276ad102b5	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 17:45:10.892-03	2025-09-19 17:45:10.892-03	\N
5177c56f-a18b-4a81-b1a6-054761e12f8b	\N	22b01915-6732-44f0-84ca-5c276ad102b5	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 17:45:11.079-03	2025-09-19 17:45:11.079-03	\N
389d7408-5996-4f66-8a77-3b7eedbc6430	\N	22b01915-6732-44f0-84ca-5c276ad102b5	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 17:45:11.27-03	2025-09-19 17:45:11.27-03	\N
5597a886-efdc-4266-8b96-aea867d3181f	\N	4df9af65-b91d-46cc-b119-6d02b5b52126	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 17:50:49.778-03	2025-09-19 17:50:49.778-03	\N
49d6e1a2-3f77-4086-922e-aee3ca327bd2	\N	4df9af65-b91d-46cc-b119-6d02b5b52126	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 17:50:49.965-03	2025-09-19 17:50:49.965-03	\N
8a257e31-c271-460e-9812-76787dd304a5	\N	4df9af65-b91d-46cc-b119-6d02b5b52126	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 17:50:50.146-03	2025-09-19 17:50:50.146-03	\N
ff943e2e-8e51-466f-84f4-a95149a6387e	\N	bc2797de-d533-453b-ae07-1e2c5de49957	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 17:52:43.268-03	2025-09-19 17:52:43.268-03	\N
5564fab9-6fce-45bd-831f-5786ab0492bb	\N	bc2797de-d533-453b-ae07-1e2c5de49957	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 17:52:43.456-03	2025-09-19 17:52:43.456-03	\N
4dd4c2d0-bff7-4bec-854e-e2a1d1ba9f0d	\N	bc2797de-d533-453b-ae07-1e2c5de49957	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 17:52:43.643-03	2025-09-19 17:52:43.643-03	\N
a53632a6-b1ec-4017-b752-242462a4bd6a	\N	c19416b1-13c1-48f4-a6bd-2a0742c76e8d	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 21:45:45.98-03	2025-09-19 21:45:45.98-03	\N
c30c4dcb-0544-46e3-8537-befec7eaa98b	\N	c19416b1-13c1-48f4-a6bd-2a0742c76e8d	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 21:45:46.212-03	2025-09-19 21:45:46.212-03	\N
11c51786-ed35-47d1-a0ba-25bc7e31c32a	\N	c19416b1-13c1-48f4-a6bd-2a0742c76e8d	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 21:45:46.403-03	2025-09-19 21:45:46.403-03	\N
91fbc500-ae08-4c05-835c-6d829793d9ba	\N	03665e11-33aa-42f0-8371-12eed398603c	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 21:48:32.587-03	2025-09-19 21:48:32.587-03	\N
38445701-168c-450c-b527-13c72b619604	\N	03665e11-33aa-42f0-8371-12eed398603c	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 21:48:32.776-03	2025-09-19 21:48:32.776-03	\N
d0729baa-06af-45ab-8a62-18ffe642145e	\N	03665e11-33aa-42f0-8371-12eed398603c	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 21:48:32.968-03	2025-09-19 21:48:32.968-03	\N
a4715ec2-4b8b-432a-900a-f4e5855b9303	\N	20da32f3-5bd8-45e3-a637-c65054251d18	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 21:52:22.577-03	2025-09-19 21:52:22.577-03	\N
53c286e1-53f9-419a-8303-f30af4dec105	\N	20da32f3-5bd8-45e3-a637-c65054251d18	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 21:52:22.762-03	2025-09-19 21:52:22.762-03	\N
e1edb3b5-91b6-4316-b94c-118ac90f7f81	\N	20da32f3-5bd8-45e3-a637-c65054251d18	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 21:52:22.947-03	2025-09-19 21:52:22.947-03	\N
a9b20adf-bead-4658-880b-059b2877b572	\N	f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 22:16:12.206-03	2025-09-19 22:16:12.206-03	\N
3e26cbfb-88ea-4dd4-8339-2556aad38f7b	\N	f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 22:16:12.394-03	2025-09-19 22:16:12.394-03	\N
74958a30-cd8b-469b-a847-45c56d1bafa2	\N	f17a78a8-ec0e-4df4-a1e0-ff76a2b30d20	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 22:16:12.594-03	2025-09-19 22:16:12.594-03	\N
b41d859a-b1ca-4560-9592-46eab0647f09	\N	621e348f-d5ee-418d-947c-8e7e552059f2	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 22:16:22.355-03	2025-09-19 22:16:22.355-03	\N
8e199697-9ca9-45fe-a193-8f5f1c0d9f40	\N	621e348f-d5ee-418d-947c-8e7e552059f2	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 22:16:22.539-03	2025-09-19 22:16:22.539-03	\N
fde4f8af-cbcb-48e4-86dc-c79bdc97bef5	\N	621e348f-d5ee-418d-947c-8e7e552059f2	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 22:16:22.725-03	2025-09-19 22:16:22.725-03	\N
0d9468d0-7063-4ce9-8036-1c138763e7a8	\N	4d8b5d5b-39a5-4f70-823b-064b08108388	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 22:26:04.856-03	2025-09-19 22:26:04.856-03	\N
7769dc39-234e-4b81-9f80-02b4e8677b48	\N	4d8b5d5b-39a5-4f70-823b-064b08108388	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 22:26:05.12-03	2025-09-19 22:26:05.12-03	\N
d2df4d94-9e51-4eff-bad4-5779641285a1	\N	4d8b5d5b-39a5-4f70-823b-064b08108388	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 22:26:05.31-03	2025-09-19 22:26:05.31-03	\N
fc98f7f2-986b-410a-a616-6b6c9e37c509	\N	ec39a570-883f-4ee4-a466-e62d696c7256	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 22:29:02.363-03	2025-09-19 22:29:02.363-03	\N
b6a33e22-def7-43fa-91bb-5fc6d0828534	\N	ec39a570-883f-4ee4-a466-e62d696c7256	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 22:29:02.555-03	2025-09-19 22:29:02.555-03	\N
e9119d17-8ada-4d9c-9013-ea26119bec91	\N	ec39a570-883f-4ee4-a466-e62d696c7256	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 22:29:02.741-03	2025-09-19 22:29:02.741-03	\N
5bc0af52-9e34-48eb-96f6-44ab6c6c1bbc	\N	5ab11918-f299-45f9-8973-84ee7294cffb	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 22:34:54.332-03	2025-09-19 22:34:54.332-03	\N
1e1c86cf-cb3f-4746-8e0d-0b613112e4eb	\N	5ab11918-f299-45f9-8973-84ee7294cffb	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 22:34:54.521-03	2025-09-19 22:34:54.521-03	\N
8efeb543-9b2a-400d-aa42-bc1dcc3f98e3	\N	5ab11918-f299-45f9-8973-84ee7294cffb	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 22:34:54.722-03	2025-09-19 22:34:54.722-03	\N
71722223-0ed5-4a7d-961c-979461abd139	\N	34dde290-1467-4d40-a293-75b17bf7fcda	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 22:42:39.393-03	2025-09-19 22:42:39.393-03	\N
20c65517-4b6d-44da-9a9b-33e654350e28	\N	34dde290-1467-4d40-a293-75b17bf7fcda	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-19 22:42:39.578-03	2025-09-19 22:42:39.578-03	\N
ae66d589-be70-4049-8d50-622907f7a7dc	\N	34dde290-1467-4d40-a293-75b17bf7fcda	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-19 22:42:39.768-03	2025-09-19 22:42:39.768-03	\N
2e8d3179-9fe5-426c-be8b-66e8d84f032a	\N	e6a642c9-d543-407b-a74d-69b6f5e926f7	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 00:58:58.61-03	2025-09-20 00:58:58.61-03	\N
ce72eefd-94af-42e9-bc90-b2486379cc1a	\N	e6a642c9-d543-407b-a74d-69b6f5e926f7	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 00:58:58.799-03	2025-09-20 00:58:58.799-03	\N
b8cac498-1af3-4969-be27-de0ce7c4a99d	\N	e6a642c9-d543-407b-a74d-69b6f5e926f7	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 00:58:58.988-03	2025-09-20 00:58:58.988-03	\N
45ec6c8e-5225-4cf0-81ea-7886ba1f5747	\N	4c40d1e6-c624-4fdd-864c-716c006618d6	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:10:34.413-03	2025-09-20 01:10:34.413-03	\N
c87e5621-0964-4255-995d-32769683e5bd	\N	4c40d1e6-c624-4fdd-864c-716c006618d6	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:10:34.592-03	2025-09-20 01:10:34.592-03	\N
f945e684-6535-4339-b9cb-f08b5329baae	\N	4c40d1e6-c624-4fdd-864c-716c006618d6	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:10:34.775-03	2025-09-20 01:10:34.775-03	\N
024a677d-8110-4fe3-b534-fd69a131df04	\N	d5632389-ae5f-4cb2-b02c-a52ed736033e	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:13:13.759-03	2025-09-20 01:13:13.759-03	\N
0137af52-0045-4542-90d7-052fb8852157	\N	d5632389-ae5f-4cb2-b02c-a52ed736033e	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:13:13.941-03	2025-09-20 01:13:13.941-03	\N
63f2ef32-b213-46a4-9f30-221207a24793	\N	d5632389-ae5f-4cb2-b02c-a52ed736033e	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:13:14.126-03	2025-09-20 01:13:14.126-03	\N
1fd3ff0d-be74-462e-9611-76bcd75c7f87	\N	9fdba450-da30-4623-b444-d209dcac9287	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:13:23.715-03	2025-09-20 01:13:23.715-03	\N
cb8580a4-724d-4db3-9cfb-daebf7e85392	\N	9fdba450-da30-4623-b444-d209dcac9287	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:13:23.896-03	2025-09-20 01:13:23.896-03	\N
11bf9ceb-fde4-411c-b3f3-61f66da7f00e	\N	9fdba450-da30-4623-b444-d209dcac9287	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:13:24.082-03	2025-09-20 01:13:24.082-03	\N
6c8732c3-252f-4947-97b2-46313db15c39	\N	a1719265-616b-4c45-96db-7cc251157458	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:13:54.396-03	2025-09-20 01:13:54.396-03	\N
aa3fd93a-e802-4bd9-a3ad-87a78477ad83	\N	a1719265-616b-4c45-96db-7cc251157458	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:13:54.581-03	2025-09-20 01:13:54.581-03	\N
52050b6d-2a27-4f1a-b0e3-0fcc1324a452	\N	a1719265-616b-4c45-96db-7cc251157458	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:13:54.767-03	2025-09-20 01:13:54.767-03	\N
e6257fbc-27c4-47e6-bca0-a1111284a0a7	\N	33111ce2-f5b2-4478-a4ef-de03ac8fbe32	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:14:13.446-03	2025-09-20 01:14:13.446-03	\N
c7cd675e-be9b-4660-b883-14f0e59c3a63	\N	33111ce2-f5b2-4478-a4ef-de03ac8fbe32	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:14:13.632-03	2025-09-20 01:14:13.632-03	\N
3e7e7b3c-a7db-41cb-a3da-e3e77acd6edf	\N	33111ce2-f5b2-4478-a4ef-de03ac8fbe32	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:14:13.815-03	2025-09-20 01:14:13.815-03	\N
06220820-8b25-4838-8a5e-34325a490b31	\N	1ea76be3-2cf1-42cf-b483-f058d053b2c4	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:16:40.999-03	2025-09-20 01:16:40.999-03	\N
b3fe9508-4d60-400a-af13-800837a00b32	\N	1ea76be3-2cf1-42cf-b483-f058d053b2c4	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:16:41.187-03	2025-09-20 01:16:41.187-03	\N
f7f97046-4bd8-45f5-a1f3-3d1696569fca	\N	1ea76be3-2cf1-42cf-b483-f058d053b2c4	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:16:41.367-03	2025-09-20 01:16:41.367-03	\N
b0c58df6-ef4e-40db-a543-97f74c154e9c	\N	59ec0ef5-5817-4d10-83ce-9f1b230d2322	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:16:50.179-03	2025-09-20 01:16:50.179-03	\N
5bad797c-c7d8-47fa-9fc1-2bf5245cb81c	\N	59ec0ef5-5817-4d10-83ce-9f1b230d2322	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:16:50.365-03	2025-09-20 01:16:50.365-03	\N
a0c9cb80-cfdd-4865-a1d3-1ea824cec74f	\N	59ec0ef5-5817-4d10-83ce-9f1b230d2322	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:16:50.548-03	2025-09-20 01:16:50.548-03	\N
34231228-ce70-4e16-8dfa-637d4d22a255	\N	d2333798-adce-4b61-a3f8-ca47443a7560	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:47:58.54-03	2025-09-20 01:47:58.54-03	\N
56369ec1-30e6-4df6-beb8-639af5819c12	\N	d2333798-adce-4b61-a3f8-ca47443a7560	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:47:58.725-03	2025-09-20 01:47:58.725-03	\N
a0d13eae-b0a9-4366-aa2e-ff9996895ebb	\N	d2333798-adce-4b61-a3f8-ca47443a7560	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:47:58.907-03	2025-09-20 01:47:58.907-03	\N
0f83577b-da13-4e0a-ad87-08155762ab23	\N	ee463fba-2ff1-41db-8d06-9216804ebe4d	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:53:14.866-03	2025-09-20 01:53:14.866-03	\N
18cce749-dd98-4bfc-834f-0891c32430f9	\N	ee463fba-2ff1-41db-8d06-9216804ebe4d	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:53:15.05-03	2025-09-20 01:53:15.05-03	\N
12b50350-eb10-41ff-84ac-382bd3e9e969	\N	ee463fba-2ff1-41db-8d06-9216804ebe4d	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:53:15.236-03	2025-09-20 01:53:15.236-03	\N
2213b499-6b18-43ab-a624-705be775c8a7	\N	306613e2-8ca8-4270-a636-14ec5ff186bd	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:53:26.069-03	2025-09-20 01:53:26.069-03	\N
ea60cb42-ae5e-4be8-bad1-ad7a2f9e5c65	\N	306613e2-8ca8-4270-a636-14ec5ff186bd	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:53:26.262-03	2025-09-20 01:53:26.262-03	\N
5cebe851-3f32-4846-b6a8-f137b4de8be3	\N	306613e2-8ca8-4270-a636-14ec5ff186bd	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:53:26.46-03	2025-09-20 01:53:26.46-03	\N
118ce0f5-4f6b-4594-afb9-5429f79edc04	\N	0e0a1874-8c35-4561-a5a7-c7199da57a56	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 01:54:21.444-03	2025-09-20 01:54:21.444-03	\N
eed5b518-39a1-4511-ac59-989604a9d0ac	\N	0e0a1874-8c35-4561-a5a7-c7199da57a56	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 01:54:21.633-03	2025-09-20 01:54:21.633-03	\N
53cbdb39-0969-4055-a8bc-f00e25d06c1b	\N	0e0a1874-8c35-4561-a5a7-c7199da57a56	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 01:54:21.816-03	2025-09-20 01:54:21.816-03	\N
2276ab3f-0949-4989-947d-fb51c4ce2e53	\N	0fcd8594-693c-431d-bfa2-a044619f7981	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 02:00:46.15-03	2025-09-20 02:00:46.15-03	\N
45d757fa-d555-4653-9469-d01fd28bc3ad	\N	0fcd8594-693c-431d-bfa2-a044619f7981	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 02:00:46.336-03	2025-09-20 02:00:46.336-03	\N
c7bd916d-acb4-4b0e-8d2f-a8cec4a5ee87	\N	0fcd8594-693c-431d-bfa2-a044619f7981	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 02:00:46.528-03	2025-09-20 02:00:46.528-03	\N
3b2b28e5-3f6d-42cf-99a7-70e2b80cb0f9	\N	625276f3-24e2-49d6-8a2a-5c35ef494128	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 02:04:16.131-03	2025-09-20 02:04:16.131-03	\N
3b853ef3-3551-4dc5-8599-c1d8cdfb0faf	\N	625276f3-24e2-49d6-8a2a-5c35ef494128	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 02:04:16.323-03	2025-09-20 02:04:16.323-03	\N
f5d08fbb-a605-45dd-b758-f67de7646c13	\N	625276f3-24e2-49d6-8a2a-5c35ef494128	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 02:04:16.507-03	2025-09-20 02:04:16.507-03	\N
a191fc39-3ffd-4fac-b1f0-950943e96765	\N	f6564040-0bba-41d2-be04-c38cc51dfc40	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 02:41:16.946-03	2025-09-20 02:41:16.946-03	\N
fdf0383a-237b-4c7a-800a-1da82d2e4882	\N	f6564040-0bba-41d2-be04-c38cc51dfc40	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 02:41:17.151-03	2025-09-20 02:41:17.151-03	\N
082ef799-68a0-4348-b781-2f73f42c3b00	\N	f6564040-0bba-41d2-be04-c38cc51dfc40	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 02:41:17.333-03	2025-09-20 02:41:17.333-03	\N
a9f707dc-6970-41d6-aed4-89ba36343b5a	\N	e8656871-3d0c-4afd-9751-cfc12d7d0b33	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-20 02:47:54.357-03	2025-09-20 02:47:54.357-03	\N
d6301f31-da3b-4c64-b893-109215df508d	\N	e8656871-3d0c-4afd-9751-cfc12d7d0b33	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-20 02:47:54.361-03	2025-09-20 02:47:54.361-03	\N
b0e4417d-ff09-4016-9f1a-81edf058ecc5	\N	e8656871-3d0c-4afd-9751-cfc12d7d0b33	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-20 02:47:54.364-03	2025-09-20 02:47:54.364-03	\N
45951402-f089-4eef-a871-994de52f73e7	\N	07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-22 22:47:19.973-03	2025-09-22 22:47:19.973-03	\N
4cb75a47-2a9d-4c2f-b3bc-ff5640ad2985	\N	07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-22 22:47:20.156-03	2025-09-22 22:47:20.156-03	\N
4869cc4a-e0fd-459b-80c5-0b22d0188d01	\N	07c3887a-a6d3-45f4-b74c-f3b0ec3975d8	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-22 22:47:20.34-03	2025-09-22 22:47:20.34-03	\N
c3e9218f-8017-47cb-9ef7-a63e5221250d	\N	dbf880d4-b04f-4684-81a7-e461661d7599	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-22 23:05:29.987-03	2025-09-22 23:05:29.987-03	\N
7a22b142-bd8c-44b0-8fec-ada98e56e425	\N	dbf880d4-b04f-4684-81a7-e461661d7599	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-22 23:05:30.177-03	2025-09-22 23:05:30.177-03	\N
92312fe7-b937-4cb8-9ecf-3353b067da24	\N	dbf880d4-b04f-4684-81a7-e461661d7599	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-22 23:05:30.386-03	2025-09-22 23:05:30.386-03	\N
f8d49d40-e8c8-46b9-a7d4-de467add1bfb	\N	114c15ad-7dfa-49f9-8e88-381c46bf7f9b	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-22 23:10:55.895-03	2025-09-22 23:10:55.895-03	\N
f06da820-2d60-4091-a41d-6b74dc2c4c88	\N	114c15ad-7dfa-49f9-8e88-381c46bf7f9b	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-22 23:10:56.077-03	2025-09-22 23:10:56.077-03	\N
e7c2f661-c382-4b83-8662-ad7692d6b22e	\N	114c15ad-7dfa-49f9-8e88-381c46bf7f9b	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-22 23:10:56.263-03	2025-09-22 23:10:56.263-03	\N
885f588a-4f8f-41c6-bc2e-ca305a1b08b3	\N	8e64840e-be77-4470-8ba0-ea18fcbf0eaa	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-22 23:14:20.12-03	2025-09-22 23:14:20.12-03	\N
8630a553-93f4-4e9a-9e71-001c1480ecb7	\N	8e64840e-be77-4470-8ba0-ea18fcbf0eaa	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-22 23:14:20.31-03	2025-09-22 23:14:20.31-03	\N
4e1f2a13-57f5-434c-9177-4a25087aa42f	\N	8e64840e-be77-4470-8ba0-ea18fcbf0eaa	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-22 23:14:20.495-03	2025-09-22 23:14:20.495-03	\N
d3a1a02c-9139-4faa-946c-1c218d4efa8f	\N	0e4001c7-4de0-47d9-a041-72d26a5f1c51	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-22 23:34:08.334-03	2025-09-22 23:34:08.334-03	\N
81ba29c0-1560-4f37-bc93-1b2c0b2ff3be	\N	0e4001c7-4de0-47d9-a041-72d26a5f1c51	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-22 23:34:08.339-03	2025-09-22 23:34:08.339-03	\N
5af25f4f-6afc-4d3d-8ba9-75e6a662edc1	\N	0e4001c7-4de0-47d9-a041-72d26a5f1c51	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-22 23:34:08.342-03	2025-09-22 23:34:08.342-03	\N
7d27b16e-272c-470c-9d38-c346e4572b9c	\N	38264b46-354b-470f-adaa-a05336cc3637	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-24 15:54:31.253-03	2025-09-24 15:54:31.253-03	\N
435e169c-fd70-478b-8f69-829378dc302d	\N	38264b46-354b-470f-adaa-a05336cc3637	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-24 15:54:31.442-03	2025-09-24 15:54:31.442-03	\N
fadbec33-642e-4721-9e14-eed89bfefcc7	\N	38264b46-354b-470f-adaa-a05336cc3637	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-24 15:54:31.636-03	2025-09-24 15:54:31.636-03	\N
90a749c7-a32a-4733-977e-3aa8eb7bdd4b	\N	5dec4e20-4cb0-40be-8977-c0e9adefa1d9	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-24 17:37:16.706-03	2025-09-24 17:37:16.706-03	\N
d2d67a2f-c094-43f7-942a-162697aab36f	\N	5dec4e20-4cb0-40be-8977-c0e9adefa1d9	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-24 17:37:16.892-03	2025-09-24 17:37:16.892-03	\N
2f2eb3e2-c35d-4db0-a7c2-d3f0ae050b71	\N	5dec4e20-4cb0-40be-8977-c0e9adefa1d9	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-24 17:37:17.081-03	2025-09-24 17:37:17.081-03	\N
d6222256-9be1-4a67-a830-839a46aeedce	\N	8d8ff20f-8b71-4f49-9411-b1e014cad063	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-25 22:44:40.451-03	2025-09-25 22:44:40.451-03	\N
bb67dc54-e993-4aeb-a0d5-0ec9640148f5	\N	8d8ff20f-8b71-4f49-9411-b1e014cad063	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-25 22:44:40.645-03	2025-09-25 22:44:40.645-03	\N
de19a5cc-6c21-462d-bf31-162aefc4c4ed	\N	8d8ff20f-8b71-4f49-9411-b1e014cad063	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-25 22:44:40.839-03	2025-09-25 22:44:40.839-03	\N
9eef9556-a553-4cf1-afc7-9ffd691107b9	\N	867746fd-3653-4b86-bc6f-bf1f1d8785f3	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-25 23:17:19.022-03	2025-09-25 23:17:19.022-03	\N
4ab18d72-423e-4a8e-8cc2-c451d3ed832f	\N	867746fd-3653-4b86-bc6f-bf1f1d8785f3	550e8400-e29b-41d4-a716-446655440202	1	399.00	399.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-25 23:17:19.208-03	2025-09-25 23:17:19.208-03	\N
dac97298-9df2-4f9c-8dfa-98c271bac23d	\N	867746fd-3653-4b86-bc6f-bf1f1d8785f3	550e8400-e29b-41d4-a716-446655440203	1	250.00	250.00	3 mg subcutaneous injection daily	\N	2025-09-25 23:17:19.4-03	2025-09-25 23:17:19.4-03	\N
\.


--
-- TOC entry 7333 (class 0 OID 50894)
-- Dependencies: 223
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Payment" (id, "deletedAt", "orderId", "stripePaymentIntentId", status, "paymentMethod", amount, currency, "refundedAmount", "stripeChargeId", "stripeCustomerId", "lastFourDigits", "cardBrand", "cardCountry", "stripeMetadata", "failureReason", "paidAt", "refundedAt", "createdAt", "updatedAt", "brandSubscriptionId") FROM stdin;
8fb95243-961a-438c-b33d-9ef508ec06c0	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	pi_3S7qR4GWJaDesMl93GrqozS5	pending	card	2000.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 01:24:10.695-03	2025-09-16 01:24:10.695-03	\N
108d84d4-1790-40fa-91a0-aabe43c42d8e	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	pi_3S7qZGGWJaDesMl93ZLUL2o1	pending	card	1300.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 01:32:38.118-03	2025-09-16 01:32:38.118-03	\N
d6851026-619e-4d14-967d-31f443d1e6dd	\N	c451ffec-5618-47e8-a849-b5aee9def1db	pi_3S7qfWGWJaDesMl90Fs9XXav	pending	card	350.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 01:39:06.213-03	2025-09-16 01:39:06.213-03	\N
992f678c-98c8-4ff4-95db-a8960c7015d7	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	pi_3S7qstGWJaDesMl918PqxFGD	pending	card	2100.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 01:52:55.799-03	2025-09-16 01:52:55.799-03	\N
977b03a3-4f69-4c23-9f2b-b1e751624066	\N	67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	pi_3S7rEdGWJaDesMl93OLi9K0S	pending	card	900.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 02:15:23.099-03	2025-09-16 02:15:23.099-03	\N
c6fbcea2-d847-4130-8bb6-9f93a2a937b6	\N	22659bdc-ce0d-4ee7-bf69-869fd119d0c2	pi_3S89MoGWJaDesMl93aI3CHTt	pending	card	79.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 21:37:03.078-03	2025-09-16 21:37:03.078-03	\N
129b2f91-3f0e-4ba7-8293-3237fc2ae603	\N	d1526926-5dd0-4cc4-87e1-d060a312dc3a	pi_3S8wzRGWJaDesMl92URWNwNM	pending	card	299.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-19 02:36:13.284-03	2025-09-19 02:36:13.284-03	\N
05e0c5a3-75c9-49b5-96e4-5fcfde61dd27	\N	32f70bf9-e1a1-4258-945d-791d5b469c3e	pi_3S8xmsGWJaDesMl91F4TxPa4	pending	card	698.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-19 03:27:18.897-03	2025-09-19 03:27:18.897-03	\N
31f501c2-9159-4eb1-9c1b-907762db5320	\N	867746fd-3653-4b86-bc6f-bf1f1d8785f3	pi_3SBRDoELzhgYQXTR1OYuNMup	cancelled	card	199.00	usd	\N	\N	\N	\N	\N	\N	{"userId": "4edbbd82-9bb1-401d-bd9b-ab4565e3eeee", "orderId": "867746fd-3653-4b86-bc6f-bf1f1d8785f3", "order_type": "subscription_initial_payment", "treatmentId": "b689451f-db88-4c98-900e-df3dbcfebe2a", "stripePriceId": "price_1S9IaGELzhgYQXTR0oOellfG"}	\N	\N	\N	2025-09-25 23:17:20.201-03	2025-10-02 23:17:30.42-03	\N
50962a46-afcd-4571-932a-87919fe395cd	\N	\N	pi_3SEDRdELzhgYQXTR0BK72a4t	succeeded	card	1500.00	usd	\N	\N	\N	\N	\N	\N	{"amount": "1500", "userId": "1f8acc57-f137-4b51-ad44-cad317ba43cf", "planType": "standard_build"}	\N	2025-10-03 16:10:33.131-03	\N	2025-10-03 15:11:05.427-03	2025-10-03 16:10:33.134-03	\N
1142a822-4a05-418c-92ff-c0c5871aaac5	\N	\N	pi_3SEDYkELzhgYQXTR1XOaOG4P	succeeded	card	1500.00	usd	\N	\N	\N	\N	\N	\N	{"amount": "1500", "userId": "1f8acc57-f137-4b51-ad44-cad317ba43cf", "planType": "standard_build"}	\N	2025-10-03 15:18:53.392-03	\N	2025-10-03 15:18:26.143-03	2025-10-03 15:18:53.392-03	\N
0d30e240-a640-401e-bffc-cb47dcf197e0	\N	\N	pi_3SGPOGELzhgYQXTR1ubomL5p	succeeded	card	3500.00	usd	\N	\N	\N	\N	\N	\N	{"amount": "3500.00", "userId": "1f8acc57-f137-4b51-ad44-cad317ba43cf", "brandSubscriptionPlanId": "9583b423-b875-4b13-9444-0118c15b5262"}	\N	2025-10-09 16:21:51.677-03	\N	2025-10-09 16:20:40.451-03	2025-10-09 16:21:51.678-03	da2ca545-6472-45c2-b457-45337001a7ce
\.


--
-- TOC entry 7334 (class 0 OID 50902)
-- Dependencies: 224
-- Data for Name: Physician; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Physician" (id, "deletedAt", "firstName", "middleName", "lastName", "phoneNumber", email, street, street2, city, state, zip, licenses, "pharmacyPhysicianId", "createdAt", "updatedAt", "mdPhysicianId") FROM stdin;
\.


--
-- TOC entry 7335 (class 0 OID 50908)
-- Dependencies: 225
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Prescription" (id, "deletedAt", name, "expiresAt", "writtenAt", "patientId", "doctorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 7336 (class 0 OID 50911)
-- Dependencies: 226
-- Data for Name: PrescriptionProducts; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."PrescriptionProducts" (id, "deletedAt", "prescriptionId", quantity, "productId", "createdAt", "updatedAt", "pharmacyProductId") FROM stdin;
\.


--
-- TOC entry 7337 (class 0 OID 50914)
-- Dependencies: 227
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Product" (id, "deletedAt", name, description, price, "activeIngredients", dosage, "imageUrl", "createdAt", "updatedAt", "pharmacyProductId", "pharmacyProvider", active, "pharmacyWholesaleCost", "medicationSize", category, "requiredDoctorQuestions", "isActive", "suggestedRetailPrice", "pharmacyVendor", "pharmacyApiConfig", slug) FROM stdin;
550e8400-e29b-41d4-a716-446655440001	\N	NAD+ IV Infusion	High-dose NAD+ delivered intravenously to replenish cellular energy, support DNA repair, and promote anti-aging benefits.	350	{NAD+}	500 mg per infusion	https://example.com/images/nad-iv.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440002	\N	NAD+ Capsules	Daily supplement containing bioavailable NAD+ precursors to maintain energy and support healthy aging.	79	{NAD+,Niacinamide}	300 mg daily	https://example.com/images/nad-capsules.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440003	\N	NAD+ Longevity Drip	Combination of NAD+ with B vitamins to enhance metabolism, reduce fatigue, and support nervous system health.	400	{NAD+,"Vitamin B12","Vitamin B6"}	750 mg NAD+ + B-complex per infusion	https://example.com/images/nad-b-complex.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440004	\N	NAD+ Detox Booster	Powerful anti-aging and detox combination with NAD+ and glutathione to fight oxidative stress and restore cellular health.	450	{NAD+,Glutathione}	500 mg NAD+ + 2000 mg Glutathione per infusion	https://example.com/images/nad-glutathione.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440005	\N	NAD+ Sublingual Spray	Fast-absorbing sublingual NAD+ spray to support daily energy, mood, and anti-aging.	65	{NAD+}	50 mg per spray, 2 sprays daily	https://example.com/images/nad-spray.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440102	\N	Wegovy (Semaglutide Injection)	An FDA-approved higher-dose version of semaglutide designed specifically for chronic weight management.	1100	{Semaglutide}	2.4 mg subcutaneous injection weekly	https://example.com/images/wegovy.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440103	\N	Mounjaro (Tirzepatide Injection)	A dual GIP and GLP-1 receptor agonist that enhances weight loss and improves insulin sensitivity for type 2 diabetes and obesity.	1200	{Tirzepatide}	2.5–15 mg subcutaneous injection weekly	https://example.com/images/mounjaro.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440104	\N	Saxenda (Liraglutide Injection)	A daily GLP-1 receptor agonist injection that reduces appetite and helps with sustained weight loss.	850	{Liraglutide}	3 mg subcutaneous injection daily	https://example.com/images/saxenda.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440105	\N	Contrave (Naltrexone/Bupropion Tablets)	An oral medication combining an opioid antagonist and an antidepressant to reduce food cravings and regulate appetite.	450	{Naltrexone,Bupropion}	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	https://example.com/images/contrave.jpg	2025-09-12 22:57:34.854-03	2025-09-12 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440202	\N	Compounded Tirzepatide	Dual GIP and GLP-1 receptor agonist for enhanced weight loss results.	399	{Tirzepatide}	2.5–15 mg subcutaneous injection weekly	https://example.com/images/compounded-tirzepatide.jpg	2025-09-17 22:57:34.854-03	2025-09-17 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440203	\N	Compounded Liraglutide	Daily GLP-1 receptor agonist for appetite control and sustained weight loss.	250	{Liraglutide}	3 mg subcutaneous injection daily	https://example.com/images/compounded-liraglutide.jpg	2025-09-17 22:57:34.854-03	2025-09-17 22:57:34.854-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0251349a-11b9-462d-a7a9-dd185773c586	\N	Tamoxifen	HORMONE THERAPY - Tablet - Manufactured	1	{Tamoxifen}	20mg	/images/default-product.png	2025-09-18 19:33:12.666-03	2025-09-18 19:33:12.666-03	14324	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
03ef8ea1-464a-40ef-8e65-345648518f8e	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	10mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.582-03	2025-09-18 19:33:12.582-03	14353	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
05b2ab08-58f1-4136-91c4-6f9826dfbfb7	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	15mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.59-03	2025-09-18 19:33:12.59-03	14356	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0810111e-cde5-4ba5-8787-56eb5e6ff71d	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	2	{Armour}	3 grain 180mg	/images/default-product.png	2025-09-18 19:33:12.641-03	2025-09-18 19:33:12.641-03	615	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0aa81fa8-7a91-42bc-82ad-4e5212fd0156	\N	Semaglutide/Methylcobalamin Injection (2.5mg/2mg -3mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	145	{Semaglutide,Methylcobalamin}	7.5mg / 6mg	/images/default-product.png	2025-09-18 19:33:12.458-03	2025-09-18 19:33:12.458-03	14617	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0b001ab1-0a1e-462a-8154-a276016c2a68	\N	Semaglutide Injection (2.5mg/mL - 1mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	85	{Semaglutide}	2.5mg	/images/default-product.png	2025-09-18 19:33:12.406-03	2025-09-18 19:33:12.406-03	14389	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0bd9d470-e508-48c3-b711-c210bd19551d	\N	KYZATREX - Testosterone Undecanoate 200mg Oral	TESTOSTERONE THERAPY - CAPSULE - Manufactured	1.25	{Testosterone}	200mg	/images/default-product.png	2025-09-18 19:33:12.622-03	2025-09-18 19:33:12.622-03	14208	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440201	\N	Compounded Semaglutide	Most commonly prescribed for consistent weight management. Same active ingredient as Ozempic®.	299	{Semaglutide}	0.25–2 mg subcutaneous injection weekly	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758772025528-window.jpg	2025-09-17 22:57:34.854-03	2025-09-25 00:47:07.106-03	\N	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0d3f26a4-6b1c-40d6-8ffd-c97689bb33dd	\N	Screamer Gel MAX (Sildenafil Citrate/Theophylline Anhydrous/Phentolamine Mesylate/Pentoxifylline/L-Arginine)	FEMALE LIBIDO AND ORGASM DISFUNCTION - 15g Gel - COMPOUNDED	50	{Sildenafil}	2% / 3%/0.01%/2%/6%	/images/default-product.png	2025-09-18 19:33:12.688-03	2025-09-18 19:33:12.688-03	1163	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
0d7da3b1-2b2f-45ac-b144-5145254ad05a	\N	Syringe - Insulin	SYRINGES / MISC. - 1mL - Manufactured	0.25	{Syringe}	27G x 1 / 2 x 1ML	/images/default-product.png	2025-09-18 19:33:12.728-03	2025-09-18 19:33:12.728-03	14300	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
10604afa-0cba-4e0a-8312-ef163b4483b4	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	1mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.564-03	2025-09-18 19:33:12.564-03	14197	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
10b4d6c7-3789-4131-a7d8-6e6c43561ae3	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	7.25	{Semaglutide}	4mg	/images/default-product.png	2025-09-18 19:33:12.44-03	2025-09-18 19:33:12.44-03	14624	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
117761cc-40cb-4c47-b042-6d47f52110a8	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	12.5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.577-03	2025-09-18 19:33:12.577-03	14352	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
16082240-23a3-4ff7-9d0c-054083e8f4bd	\N	NAD+ INJECTION (200mg/ml -2.5mL)	WEIGHT LOSS - Injection - Manufactured	150	{NAD+}	500mg	/images/default-product.png	2025-09-18 19:33:12.505-03	2025-09-18 19:33:12.505-03	14388	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
16291a80-a01d-466a-857d-feed8c8e55d6	\N	Metformin HCl	WEIGHT LOSS - Tablet - Manufactured	1	{Metformin}	500mg	/images/default-product.png	2025-09-18 19:33:12.486-03	2025-09-18 19:33:12.486-03	14320	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
18cfd8a4-4e3d-45c4-96b4-ca58069b845d	\N	Finasteride	HAIR LOSS - TABLET - Manufactured	0.9	{Finasteride}	1mg	/images/default-product.png	2025-09-18 19:33:12.69-03	2025-09-18 19:33:12.69-03	14369	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
194bcdd3-69f3-4103-b7dc-7e2eacf54f97	\N	DHEA	HORMONE THERAPY - CAPSULE - Manufactured	1	{DHEA}	25mg	/images/default-product.png	2025-09-18 19:33:12.646-03	2025-09-18 19:33:12.646-03	14201	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
1d2c6a8a-2ac7-4820-bf10-34e75d13cd63	\N	Glutathione	VITAMINS/SUPPLEMENTS - Injection - Manufactured	65	{Glutathione}	100 mg / mL (30 mL)	/images/default-product.png	2025-09-18 19:33:12.706-03	2025-09-18 19:33:12.706-03	14382	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
1d583605-ae55-49ce-a030-147d649ee842	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.587-03	2025-09-18 19:33:12.587-03	14355	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
1d58b5df-abc2-4e23-a5ad-09245d626c38	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 3mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	280	{Tirzepatide,Methylcobalamin}	51mg / 6mg	/images/default-product.png	2025-09-18 19:33:12.47-03	2025-09-18 19:33:12.47-03	14402	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
1e789bd9-7b2d-4024-91fc-a159461766bb	\N	NAD+ sublingual tablet	WEIGHT LOSS - Tablet - COMPOUNDED	7	{NAD+}	50mg	/images/default-product.png	2025-09-18 19:33:12.509-03	2025-09-18 19:33:12.509-03	14347	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
1f6502f1-1556-4c33-88e0-6bd1634c8af0	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	2	{Armour}	15mg	/images/default-product.png	2025-09-18 19:33:12.637-03	2025-09-18 19:33:12.637-03	14191	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
1f985e46-1a67-46cb-a3d0-9869151cab6b	\N	Tretinoin 0.05% cream (45g)	SKIN/DERMATOLOGY -  - Manufactured	75	{Tretinoin}	0.05%	/images/default-product.png	2025-09-18 19:33:12.606-03	2025-09-18 19:33:12.606-03	14311	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
21462a9d-0466-4062-b981-6785e385a850	\N	Oxandrolone 50	HORMONE THERAPY - Capsule - COMPOUNDED	5	{Oxandrolone}	50mg	/images/default-product.png	2025-09-18 19:33:12.661-03	2025-09-18 19:33:12.661-03	399	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
2165afa1-54a6-483a-b3c2-96a6016eae47	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	8.5	{Semaglutide}	6mg	/images/default-product.png	2025-09-18 19:33:12.449-03	2025-09-18 19:33:12.449-03	14363	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
21688833-81b0-4f5f-aa62-8d21466cf4d3	\N	Progesterone	HORMONE THERAPY - Capsule - Manufactured	1	{Progesterone}	100mg	/images/default-product.png	2025-09-18 19:33:12.663-03	2025-09-18 19:33:12.663-03	14200	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
21a299a0-0fde-49f1-8121-5785e6bc60a3	\N	Tadalafil / Oxytocin / PT-141 (Bremelanotide Acetate) SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	4	{Tadalafil}	5mg / 100iu/1,000mcg	/images/default-product.png	2025-09-18 19:33:12.679-03	2025-09-18 19:33:12.679-03	14159	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
227bbe36-e5be-40e6-b605-c2a9db33f835	\N	Mounjaro	WEIGHT LOSS - Pen-Injector - Manufactured	1223	{Mounjaro}	5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.5-03	2025-09-18 19:33:12.5-03	14206	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
2647310d-5b2c-40d8-b859-35ad8a2009af	\N	SYRINGE -LUERLOCK	SYRINGES / MISC. - 3ML - Manufactured	0.25	{SYRINGE}	25G X 1 X 3ML	/images/default-product.png	2025-09-18 19:33:12.73-03	2025-09-18 19:33:12.73-03	14118	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
2b40f8d0-a2df-4569-b617-fd1a694595cd	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	23G x 1"	/images/default-product.png	2025-09-18 19:33:12.722-03	2025-09-18 19:33:12.722-03	427	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
2c55ce42-acde-4a8b-85aa-aaa68a5db276	\N	Modafinil	WEIGHT LOSS - Tablet - Manufactured	1	{Modafinil}	200mg	/images/default-product.png	2025-09-18 19:33:12.492-03	2025-09-18 19:33:12.492-03	14309	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
2edbcead-4c91-401d-bdb6-ed8039646446	\N	Semaglutide Injection (2.5mg/mL - 3mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	145	{Semaglutide}	7.5mg	/images/default-product.png	2025-09-18 19:33:12.43-03	2025-09-18 19:33:12.43-03	14391	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
3020bf00-7286-4dd9-81fb-5c93e2aaccd1	\N	Phentermine Lollipop	WEIGHT LOSS - Lollipop - COMPOUNDED	2	{Phentermine}	30mg	/images/default-product.png	2025-09-18 19:33:12.527-03	2025-09-18 19:33:12.527-03	14203	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
32a08f29-887b-47b1-a56e-dee2def30c8a	\N	Acne Gel (Tretinoin/Clindamyacin/Metronidazole/Azelaic Acid)	SKIN/DERMATOLOGY - 10g Gel - COMPOUNDED	35	{Tretinoin}	0.1% / 2%/0.75%/20%	/images/default-product.png	2025-09-18 19:33:12.598-03	2025-09-18 19:33:12.598-03	14268	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
34b2e7e3-b779-4e46-86fd-766bf8b280ee	\N	Syringe - Insulin	SYRINGES / MISC. - 1ML - Manufactured	0.1	{Syringe}	30G x 5 / 16 x 1ML	/images/default-product.png	2025-09-18 19:33:12.726-03	2025-09-18 19:33:12.726-03	14298	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
37bbf978-8d51-4f1e-bb3f-6763eebbe2fc	\N	Container (Sharps)	SYRINGES / MISC. - Each - Manufactured	7.5	{Container}	——	/images/default-product.png	2025-09-18 19:33:12.712-03	2025-09-18 19:33:12.712-03	359	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
38b98af1-663a-4aa0-80d4-8cb666c3fb1b	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	27G x 1 / 2“	/images/default-product.png	2025-09-18 19:33:12.72-03	2025-09-18 19:33:12.72-03	1013	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
38f9391c-b9fb-4250-8a0d-2055903d653b	\N	Zinc Sulfate Heptahydrate	VITAMINS/SUPPLEMENTS - Injection - Manufactured	85	{Zinc}	10mg / mL 30mL	/images/default-product.png	2025-09-18 19:33:12.707-03	2025-09-18 19:33:12.707-03	14586	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
3916eead-5627-4b88-907d-5c75e0fb0cb8	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 1mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	200	{Tirzepatide,Methylcobalamin}	17mg / 2mg	/images/default-product.png	2025-09-18 19:33:12.466-03	2025-09-18 19:33:12.466-03	14400	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
399c50fa-0f44-415e-bcc7-c358a57fed37	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	1.7mg / 0.75mL	/images/default-product.png	2025-09-18 19:33:12.571-03	2025-09-18 19:33:12.571-03	14243	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
3a7c2a88-6efd-4e76-841c-8b2f0289aea9	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	3.5	{Armour}	2 grain (120mg)	/images/default-product.png	2025-09-18 19:33:12.643-03	2025-09-18 19:33:12.643-03	169	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
3c05d2d5-5638-4238-b404-02c165737e39	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	3.7	{Semaglutide}	2mg	/images/default-product.png	2025-09-18 19:33:12.447-03	2025-09-18 19:33:12.447-03	14296	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
3ec356ba-2fb5-46d4-858b-96ca9ca36814	\N	Testosterone Gel 20% (30g)	TESTOSTERONE THERAPY - Gel - COMPOUNDED	45	{Testosterone}	20% (200mg / gm)	/images/default-product.png	2025-09-18 19:33:12.631-03	2025-09-18 19:33:12.631-03	1182	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
40d72721-e47f-4517-afb5-426385014be3	\N	Methionine/ Inositol/ Cyanocobalamin/ L-Carnitine	WEIGHT LOSS - TABLET - COMPOUNDED	1.25	{Cyanocobalamin}	25 / 25/1/100mg	/images/default-product.png	2025-09-18 19:33:12.489-03	2025-09-18 19:33:12.489-03	14181	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
4111d6f3-bec8-41ba-b65b-026af5e4d3c4	\N	NAD+ INJECTION (200mg/ml -2.5mL)	NAD+ INJECTION (200mg/ml -2.5mL)\n	150	{test}	Injection	https://www.empowerpharmacy.com/wp-content/webpc-passthru.php?src=https://www.empowerpharmacy.com/wp-content/uploads/2025/07/2025-empower-pharmacy-nad-injection-1000mg-294x490-1.jpg	2025-09-17 14:00:57.627771-03	2025-09-17 14:00:57.627771-03	14209	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
4347e0b1-59d8-4c4b-9312-95478cca3c6c	\N	Tirzepatide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	13.82	{Tirzepatide}	5mg	/images/default-product.png	2025-09-18 19:33:12.464-03	2025-09-18 19:33:12.464-03	14331	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
45e257fa-f165-4ee6-813b-8207639c533f	\N	Minoxidil / Panthenol / Tretinoin	HAIR LOSS - SERUM - COMPOUNDED	45	{Minoxidil,Tretinoin}	5% / 5% / 0.025%	/images/default-product.png	2025-09-18 19:33:12.696-03	2025-09-18 19:33:12.696-03	14371	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
479282c3-134a-4061-986d-d9645d0e4198	\N	Anastrozole	HORMONE THERAPY - Tablet - Manufactured	1	{Anastrozole}	1mg	/images/default-product.png	2025-09-18 19:33:12.635-03	2025-09-18 19:33:12.635-03	14168	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
48c6644b-6935-48fb-85ab-fc48fcb3fb1b	\N	Naltrexone	WEIGHT LOSS - Tablet - COMPOUNDED	1	{Naltrexone}	10mg	/images/default-product.png	2025-09-18 19:33:12.511-03	2025-09-18 19:33:12.511-03	1188	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
50848ed7-4587-432b-b21d-f08ab62da2b0	\N	Phentermine HCl	WEIGHT LOSS - Tablet - Manufactured	1	{Phentermine}	37.5mg	/images/default-product.png	2025-09-18 19:33:12.523-03	2025-09-18 19:33:12.523-03	14253	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
52a192f8-810a-46cc-9dd3-7d023dd6f3f2	\N	Enclomiphene Citrate SL Tablet	HORMONE THERAPY - Sublingual - COMPOUNDED	2	{Enclomiphene}	25mg	/images/default-product.png	2025-09-18 19:33:12.651-03	2025-09-18 19:33:12.651-03	14177	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
543cf219-8222-40bc-abb6-5b4df6f56025	\N	Testosterone Cypionate - Cotton Seed Oil (10mL)	TESTOSTERONE THERAPY - Injectable - Manufactured	76	{Testosterone}	200mg / mL	/images/default-product.png	2025-09-18 19:33:12.624-03	2025-09-18 19:33:12.624-03	14255	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
547d7e55-179d-4ab3-bb62-3c094fb4ce47	\N	Mounjaro	WEIGHT LOSS - Pen-Injector - Manufactured	1223	{Mounjaro}	15mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.494-03	2025-09-18 19:33:12.494-03	14204	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
557e15bb-8dc7-4888-810c-e83532908d0b	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	3	{Armour}	1.5 grain (90mg)	/images/default-product.png	2025-09-18 19:33:12.64-03	2025-09-18 19:33:12.64-03	646	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
577da129-bc77-4c11-b336-536640474b8a	\N	Benzocaine / Lidocaine / Tetracaine	SKIN/DERMATOLOGY - 50 grams - COMPOUNDED	45	{Benzocaine}	24% / 12% / 5%	/images/default-product.png	2025-09-18 19:33:12.6-03	2025-09-18 19:33:12.6-03	14372	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
585466f4-a770-4f8b-8c6c-5a6a5f1e6c94	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	25G x 1"	/images/default-product.png	2025-09-18 19:33:12.718-03	2025-09-18 19:33:12.718-03	587	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
5a5bcf82-380f-4cd3-822d-22f8b37ec5f8	\N	HCG (Pregnyl) 10,000 IU	FERTILITY / PREGNANCY - Vial - Manufactured	245	{HCG}	10,000 IU	/images/default-product.png	2025-09-18 19:33:12.702-03	2025-09-18 19:33:12.702-03	14397	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
5b7a518b-71ce-4924-99be-9c68d147342b	\N	Sildenafil/ Tadalafil SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	5	{Sildenafil,Tadalafil}	40mg / 10mg	/images/default-product.png	2025-09-18 19:33:12.673-03	2025-09-18 19:33:12.673-03	14182	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
5c57b1f6-027d-48a8-ac81-dbb37e33712e	\N	Enclomiphene Citrate SL Tablet	HORMONE THERAPY - Sublingual - COMPOUNDED	1.52	{Enclomiphene}	12.5mg	/images/default-product.png	2025-09-18 19:33:12.648-03	2025-09-18 19:33:12.648-03	14176	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
6353a369-3e98-49b9-8278-0565cb2943e7	\N	Sermorelin 3mg/mL - 5mL	SERMORELIN - Injection - Manufactured	200	{Sermorelin}	15mg	/images/default-product.png	2025-09-18 19:33:12.617-03	2025-09-18 19:33:12.617-03	14396	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
65cc8f3e-18e9-4f87-b94c-3a92da9dc055	\N	Ondansetron ODT (Zofran)	WEIGHT LOSS - Tablet - Manufactured	1	{Ondansetron}	4mg	/images/default-product.png	2025-09-18 19:33:12.516-03	2025-09-18 19:33:12.516-03	14258	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
6a8801b8-3a9f-49a3-b6a3-3a58b220b1e4	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 2mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	240	{Tirzepatide,Methylcobalamin}	34mg / 4mg	/images/default-product.png	2025-09-18 19:33:12.468-03	2025-09-18 19:33:12.468-03	14401	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
6adbfb18-134d-4ed0-8b8e-d7833ff7c015	\N	Sermorelin Acetate/Glycine Nasal Spray Gel (12mL)	SERMORELIN - Nasal Spray - COMPOUNDED	65	{Sermorelin}	250mcg / 500mcg/0.1mL	/images/default-product.png	2025-09-18 19:33:12.619-03	2025-09-18 19:33:12.619-03	1206	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
6e470f7d-1280-456a-be90-526b935677fb	\N	NAD+ INJECTION (200mg/ml - 5mL) (NOVA)	WEIGHT LOSS - Injection - Manufactured	200	{NAD+}	1,000mg	/images/default-product.png	2025-09-18 19:33:12.507-03	2025-09-18 19:33:12.507-03	14387	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
6f2a382e-00ba-4e00-8726-71e357f35ec7	\N	Minoxidil / Finasteride / Ketoconazole	HAIR LOSS - SPRAY - COMPOUNDED	30	{Finasteride,Minoxidil}	5% / 0.1% / 2%- 50ml	/images/default-product.png	2025-09-18 19:33:12.692-03	2025-09-18 19:33:12.692-03	1251	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
70205e6a-0f1e-443e-966b-816057f80684	\N	Sildenafil 100	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	100mg	/images/default-product.png	2025-09-18 19:33:12.668-03	2025-09-18 19:33:12.668-03	14398	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
70687f65-7f6c-46c4-b428-269ecd7f3bf4	\N	Tirzepatide/ Methylcobalamin Injection (17mg/2mg - 4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	320	{Tirzepatide,Methylcobalamin}	68mg / 8mg	/images/default-product.png	2025-09-18 19:33:12.473-03	2025-09-18 19:33:12.473-03	14405	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
70b28c2e-2533-4a53-9b40-a1a65cccf94d	\N	Semaglutide Injection (5.0mg/mL - 4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	350	{Semaglutide}	20mg	/images/default-product.png	2025-09-18 19:33:12.437-03	2025-09-18 19:33:12.437-03	14343	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
722420b9-9ff5-411d-ac11-38647fc5ed00	\N	Estradiol	HORMONE THERAPY - Tablet - Manufactured	0.5	{Estradiol}	1mg	/images/default-product.png	2025-09-18 19:33:12.655-03	2025-09-18 19:33:12.655-03	14222	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
784a4a0c-bbc8-48bf-a834-0c29031a8731	\N	Tretinoin 0.05%	SKIN/DERMATOLOGY - Cream - Manufactured	50	{Tretinoin}	20gm	/images/default-product.png	2025-09-18 19:33:12.602-03	2025-09-18 19:33:12.602-03	14619	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
7a3db81c-c982-4daa-bce2-f362460edadc	\N	Sildenafil 50	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	50mg	/images/default-product.png	2025-09-18 19:33:12.672-03	2025-09-18 19:33:12.672-03	14138	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
8662357b-9828-489c-afa6-0f67dfe0c2a7	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	0.25mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.569-03	2025-09-18 19:33:12.569-03	14198	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
883be894-f4e4-4934-951a-d31691cc5d33	\N	Trazodone HCl Tablet	SLEEP / ANXIETY / DEPRESSION - Tablet - Manufactured	1	{Trazodone}	50mg	/images/default-product.png	2025-09-18 19:33:12.698-03	2025-09-18 19:33:12.698-03	14294	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
8aa8fbbb-dceb-44e5-b2f7-4eab8e1e62d5	\N	Clomid (Clomiphene Citrate)	HORMONE THERAPY - Tablet - Manufactured	15	{Clomid}	50mg	/images/default-product.png	2025-09-18 19:33:12.645-03	2025-09-18 19:33:12.645-03	14188	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
8ac66b54-1ae0-4f5a-abd9-b504b33b0839	\N	Tirzepatide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	8.42	{Tirzepatide}	3mg	/images/default-product.png	2025-09-18 19:33:12.46-03	2025-09-18 19:33:12.46-03	14329	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
8c584ef6-0249-4fbc-8578-61fde96506d1	\N	Cyanocobalamin B12 (10 mL)	WEIGHT LOSS - Injection - Manufactured	25	{Cyanocobalamin}	1,000 mcg / mL	/images/default-product.png	2025-09-18 19:33:12.48-03	2025-09-18 19:33:12.48-03	14365	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
916279a1-9f28-4e90-b352-2576428fa7dd	\N	Cabergoline (8 ct.)	FERTILITY / PREGNANCY - Tablet - Manufactured	40	{Cabergoline}	0.5mg	/images/default-product.png	2025-09-18 19:33:12.701-03	2025-09-18 19:33:12.701-03	14151	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
9342885b-059d-4509-aa4e-d4178a75801c	\N	Naltrexone 5mg SR / L-Carnitine / Inositol	WEIGHT LOSS - Capsule - COMPOUNDED	2	{Naltrexone}	5 / 100/25mg	/images/default-product.png	2025-09-18 19:33:12.514-03	2025-09-18 19:33:12.514-03	1159	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
9538d25a-d880-4859-ab0d-753404df006a	\N	Sermorelin 1mg/mL - 9mL	SERMORELIN - Injection - Manufactured	170	{Sermorelin}	9mg	/images/default-product.png	2025-09-18 19:33:12.61-03	2025-09-18 19:33:12.61-03	14393	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
970fe41f-39d7-45ec-88c5-1177376e050c	\N	Sildenafil/ Tadalafil SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	7	{Sildenafil,Tadalafil}	80mg / 20mg	/images/default-product.png	2025-09-18 19:33:12.675-03	2025-09-18 19:33:12.675-03	14183	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
9a9ed28b-7155-4b8b-877a-51cda8f8f0f1	\N	Semaglutide Injection (2.5mg/mL - 2mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	95	{Semaglutide}	5mg	/images/default-product.png	2025-09-18 19:33:12.426-03	2025-09-18 19:33:12.426-03	14390	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
a006185e-ca9c-41b7-b18f-8a874386ea54	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	2.5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.58-03	2025-09-18 19:33:12.58-03	14357	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
a35c67d3-8716-4024-a037-62c9be98b57d	\N	Diethylpropion HCL	WEIGHT LOSS - Tablet - Manufactured	1	{Diethylpropion}	25mg	/images/default-product.png	2025-09-18 19:33:12.482-03	2025-09-18 19:33:12.482-03	14233	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
a4a8e740-6d6f-49cc-838c-98bf367b370e	\N	Mounjaro	WEIGHT LOSS - Pen-Injector - Manufactured	1223	{Mounjaro}	2.5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.496-03	2025-09-18 19:33:12.496-03	14205	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
a8dcc808-ed57-41e0-9a74-f83b140ab230	\N	Tretinoin 0.05%	SKIN/DERMATOLOGY - Cream - Manufactured	50	{Tretinoin}	20gm	/images/default-product.png	2025-09-18 19:33:12.604-03	2025-09-18 19:33:12.604-03	14260	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
a9c2ae46-809e-4b2d-8af9-ca7b6440207e	\N	Tadalafil / Oxytocin / PT-141 (Bremelanotide Acetate) SL Tablet	MALE ERECTILE AND LIBIDO DISFUNCTION - Sublingual - COMPOUNDED	5	{Tadalafil}	20mg / 100iu/2,000mcg	/images/default-product.png	2025-09-18 19:33:12.681-03	2025-09-18 19:33:12.681-03	14160	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
ac7686b0-7446-4845-abd6-54e1493262a4	\N	Rybelsus	WEIGHT LOSS - Tablet - Manufactured	35	{Rybelsus}	3mg	/images/default-product.png	2025-09-18 19:33:12.535-03	2025-09-18 19:33:12.535-03	2192	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
ae44df1f-66ad-4206-b256-e58875ff6a61	\N	Rybelsus	WEIGHT LOSS - Tablet - Manufactured	35	{Rybelsus}	7mg	/images/default-product.png	2025-09-18 19:33:12.533-03	2025-09-18 19:33:12.533-03	2193	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
b0ea1fa4-3809-42de-8dd4-34b53fc68f07	\N	Sildenafil 25	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	25mg	/images/default-product.png	2025-09-18 19:33:12.67-03	2025-09-18 19:33:12.67-03	14368	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
b4c40c49-255d-4af4-95be-b285d078a540	\N	Ascorbic Acid	VITAMINS/SUPPLEMENTS - Injection - Manufactured	85	{"Ascorbic Acid"}	500mg / mL (50mL)	/images/default-product.png	2025-09-18 19:33:12.704-03	2025-09-18 19:33:12.704-03	14589	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
b76cf24e-5667-46f6-9535-7e597047fb5e	\N	Sildenafil 20	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Sildenafil}	20mg	/images/default-product.png	2025-09-18 19:33:12.669-03	2025-09-18 19:33:12.669-03	14358	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
b998b9b5-005e-4aad-b29e-2512ea782027	\N	Semaglutide Injection (2.5mg/mL - 4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	175	{Semaglutide}	10mg	/images/default-product.png	2025-09-18 19:33:12.433-03	2025-09-18 19:33:12.433-03	14392	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
b9fb3f30-6eb3-4150-86c0-6bf778ced755	\N	Progesterone	HORMONE THERAPY - Capsule - Manufactured	1	{Progesterone}	200mg	/images/default-product.png	2025-09-18 19:33:12.664-03	2025-09-18 19:33:12.664-03	14214	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
baf90f8b-6aa4-4bbc-a7ff-273ed56b9ac1	\N	Armour Thyroid	HORMONE THERAPY - Tablet - Manufactured	2	{Armour}	0.5 grain (30mg)	/images/default-product.png	2025-09-18 19:33:12.638-03	2025-09-18 19:33:12.638-03	489	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
bbe6cd19-c9f9-4db1-a6a7-8a00f27d2ec6	\N	Tirzepatide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	11.12	{Tirzepatide}	4mg	/images/default-product.png	2025-09-18 19:33:12.462-03	2025-09-18 19:33:12.462-03	14330	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
bfc93381-fa04-47d3-8144-9e7a8a8f5a65	\N	Semaglutide RDT (Sublingual)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Tablet - COMPOUNDED	2.67	{Semaglutide}	1mg	/images/default-product.png	2025-09-18 19:33:12.443-03	2025-09-18 19:33:12.443-03	14289	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
c004f2dd-3665-464c-9d2c-614cfef2b121	\N	Testosterone Gel 1.62%	TESTOSTERONE THERAPY - Gel - Manufactured	85	{Testosterone}	1.62%	/images/default-product.png	2025-09-18 19:33:12.629-03	2025-09-18 19:33:12.629-03	14140	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
c3123242-5d24-4e01-a255-b0cafdb3b667	\N	Sermorelin 3mg/mL - 2mL	SERMORELIN - Injection - Manufactured	150	{Sermorelin}	6mg	/images/default-product.png	2025-09-18 19:33:12.612-03	2025-09-18 19:33:12.612-03	14394	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
c6a157e3-2632-47de-a750-50eef1e23c3b	\N	Minoxidil / Finasteride / Ketoconazole/ Dutasteride	HAIR LOSS - GEL - COMPOUNDED	50	{Finasteride,Minoxidil}	5% / 0.1% / 2% /0.005% - 51gm	/images/default-product.png	2025-09-18 19:33:12.693-03	2025-09-18 19:33:12.693-03	14153	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
c6e3d71f-51fd-4c49-8fe4-14e97ba6d08a	\N	Rybelsus	WEIGHT LOSS - Tablet - Manufactured	35	{Rybelsus}	14mg	/images/default-product.png	2025-09-18 19:33:12.53-03	2025-09-18 19:33:12.53-03	2194	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
c82a66db-db91-43a4-b0f4-2c41806385e7	\N	Zepbound	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1500	{Zepbound}	7.5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.584-03	2025-09-18 19:33:12.584-03	14354	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
cf0f9bef-2928-423a-8094-a3212f0c29e5	\N	Testosterone Gel 1.62%	TESTOSTERONE THERAPY - Gel - Manufactured	85	{Testosterone}	1.62%	/images/default-product.png	2025-09-18 19:33:12.628-03	2025-09-18 19:33:12.628-03	14370	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
cff27b13-67e8-4bb7-a46f-78d84c146c66	\N	Bupropion HCL SR	WEIGHT LOSS - Tablet - Manufactured	0.3	{Bupropion}	150mg	/images/default-product.png	2025-09-18 19:33:12.477-03	2025-09-18 19:33:12.477-03	14231	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
d2f507a5-8cab-491d-afeb-3671c07c109a	\N	Tadalafil 5	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	2.5	{Tadalafil}	5mg	/images/default-product.png	2025-09-18 19:33:12.686-03	2025-09-18 19:33:12.686-03	14315	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
d4fe6beb-8d8d-4ac8-8e34-a80c871b03e9	\N	Acarbose/Orlistat	WEIGHT LOSS - Tablet - COMPOUNDED	3	{Acarbose,Orlistat}	30mg / 100mg	/images/default-product.png	2025-09-18 19:33:12.475-03	2025-09-18 19:33:12.475-03	14237	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
d55768c9-06db-4f78-8003-63b93b8fd96f	\N	Tadalafil	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	3	{Tadalafil}	20 mg	/images/default-product.png	2025-09-18 19:33:12.677-03	2025-09-18 19:33:12.677-03	14621	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
d68e2d61-7884-4e55-84d3-9af48809f160	\N	Testosterone Enanthate	TESTOSTERONE THERAPY - 5mL / Vial - Manufactured	195	{Testosterone}	200mg / mL	/images/default-product.png	2025-09-18 19:33:12.626-03	2025-09-18 19:33:12.626-03	14172	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
d7f901d5-6d56-42d9-bd13-c3b78ec76dcd	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	18G x 1"	/images/default-product.png	2025-09-18 19:33:12.714-03	2025-09-18 19:33:12.714-03	459	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
d9ea3f60-6e14-467f-8133-e1a5b1b5b4dc	\N	Anastrozole	HORMONE THERAPY - Capsule - COMPOUNDED	1	{Anastrozole}	0.50mg	/images/default-product.png	2025-09-18 19:33:12.633-03	2025-09-18 19:33:12.633-03	400	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
da4a15a1-b9bd-42ea-8d61-c3f003249e0f	\N	Sermorelin 3mg/mL - 3mL	SERMORELIN - Injection - Manufactured	160	{Sermorelin}	9mg	/images/default-product.png	2025-09-18 19:33:12.614-03	2025-09-18 19:33:12.614-03	14395	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
db3e266a-0ca0-461b-a8b9-17062b352f8e	\N	Syringe - Insulin	SYRINGES / MISC. - 1mL - Manufactured	0.25	{Syringe}	30G x 1 / 2 x 1ML	/images/default-product.png	2025-09-18 19:33:12.724-03	2025-09-18 19:33:12.724-03	465	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
de306b99-cb68-47d8-8630-ca816b98f7cf	\N	Tadalafil 2.5 mg	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	2.5	{Tadalafil}	2.5 mg	/images/default-product.png	2025-09-18 19:33:12.685-03	2025-09-18 19:33:12.685-03	14190	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
dff788d4-fc73-44f7-be09-2f92a12c6142	\N	Sermorelin Acetate/Glycine SL Tablet	SERMORELIN - Sublingual RDT - COMPOUNDED	2	{Sermorelin}	1000 mcg / 125 mg	/images/default-product.png	2025-09-18 19:33:12.62-03	2025-09-18 19:33:12.62-03	14158	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e0a99aab-1a3e-465e-a82a-569297ab56c2	\N	Oxandrolone 25	HORMONE THERAPY - Capsule - COMPOUNDED	4	{Oxandrolone}	25mg	/images/default-product.png	2025-09-18 19:33:12.659-03	2025-09-18 19:33:12.659-03	384	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e299d39e-fbb5-45d1-8843-804f23114314	\N	Estradiol	HORMONE THERAPY - Tablet - Manufactured	0.64	{Estradiol}	2mg	/images/default-product.png	2025-09-18 19:33:12.657-03	2025-09-18 19:33:12.657-03	14223	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e2a503e4-06ec-47c7-9a28-c0e58b7b2bf5	\N	Saxenda	WEIGHT LOSS - 5 Auto-Injectors - Manufactured	1588	{Saxenda}	18mg / 3mL	/images/default-product.png	2025-09-18 19:33:12.538-03	2025-09-18 19:33:12.538-03	2198	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e64de50b-70f3-4c88-a0ea-4464c9546073	\N	Semaglutide/Methylcobalamin Injection (2.5mg/2mg -2mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	95	{Semaglutide,Methylcobalamin}	5mg / 4mg	/images/default-product.png	2025-09-18 19:33:12.456-03	2025-09-18 19:33:12.456-03	14616	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e7c61c1f-6bf1-41ce-875b-1995cc7354ca	\N	Tretinoin Cream 0.1% Cream (20g)	SKIN/DERMATOLOGY - CREAM - Manufactured	48.17	{Tretinoin}	0.1%	/images/default-product.png	2025-09-18 19:33:12.608-03	2025-09-18 19:33:12.608-03	14380	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e8afb497-5cf7-4043-b93e-357e1f172ddf	\N	Semaglutide/Methylcobalamin Injection (10mg/8mg -4mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	175	{Semaglutide,Methylcobalamin}	10mg / 8mg	/images/default-product.png	2025-09-18 19:33:12.452-03	2025-09-18 19:33:12.452-03	14618	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
e8f89574-66d9-451c-b360-1b5c6cb84471	\N	Acyclovir	SEXUAL HEALTH - 15gm - Manufactured	60	{Acyclovir}	5%	/images/default-product.png	2025-09-18 19:33:12.699-03	2025-09-18 19:33:12.699-03	14366	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
eb4eca6c-86ba-4d30-abdb-5acf3b9eb924	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	0.5mg / 0.5mL	/images/default-product.png	2025-09-18 19:33:12.567-03	2025-09-18 19:33:12.567-03	14242	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
ecb41c2d-1873-4f91-91d1-596e4fe8bae6	\N	Acne Astringent (Salicylic Acid/ Niacinamide)	SKIN/DERMATOLOGY - 12mL Spray - COMPOUNDED	25	{Acne}	2% / 5%	/images/default-product.png	2025-09-18 19:33:12.596-03	2025-09-18 19:33:12.596-03	14269	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
ed820b10-b2bb-4cdd-b498-38c2b4c753a1	\N	Diethylpropion HCL ER	WEIGHT LOSS - Tablet - Manufactured	1.1	{Diethylpropion}	75mg	/images/default-product.png	2025-09-18 19:33:12.483-03	2025-09-18 19:33:12.483-03	14232	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
f1d8007f-7ca9-44b8-8a89-5a3bc4511e88	\N	Wegovy	WEIGHT LOSS - 4 Auto-Injectors - Manufactured	1599	{Wegovy}	2.4mg / 0.75mL	/images/default-product.png	2025-09-18 19:33:12.574-03	2025-09-18 19:33:12.574-03	1588	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
f35e4739-07dc-42e5-ac44-7733b5a941dc	\N	Alcohol Prep Pad	SYRINGES / MISC. - Each - Manufactured	0.05	{Alcohol}	——	/images/default-product.png	2025-09-18 19:33:12.709-03	2025-09-18 19:33:12.709-03	358	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
f98f57e0-8998-4ddd-b0ba-82d3ec3ce933	\N	Bacteriostatic Water (Manufactured)	SYRINGES / MISC. - 30mL - Manufactured	10	{Bacteriostatic}	——	/images/default-product.png	2025-09-18 19:33:12.71-03	2025-09-18 19:33:12.71-03	418	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
fa05060d-a14c-472b-bfd3-4b0761b31922	\N	Tadalafil 10	MALE ERECTILE AND LIBIDO DISFUNCTION - Tablet - Manufactured	2.5	{Tadalafil}	10mg	/images/default-product.png	2025-09-18 19:33:12.683-03	2025-09-18 19:33:12.683-03	14314	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
fa8943a9-7c84-4aad-8a9d-f7e29787cf54	\N	Needle Only	SYRINGES / MISC. - Each - Manufactured	0.25	{Needle}	20g x 1”	/images/default-product.png	2025-09-18 19:33:12.716-03	2025-09-18 19:33:12.716-03	429	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
fb309063-48fe-4f77-a243-2552b3dc254e	\N	Semaglutide/Methylcobalamin Injection (2.5mg/2mg -1mL)	GLP-1 - SEMAGLUTIDE - TIRZEPATIDE - Injection - Manufactured	85	{Semaglutide,Methylcobalamin}	2.5mg / 2mg	/images/default-product.png	2025-09-18 19:33:12.454-03	2025-09-18 19:33:12.454-03	14615	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
fc6f43f2-0f92-4266-ae70-fab26e4c69fd	\N	Estradiol	HORMONE THERAPY - Tablet - Manufactured	0.45	{Estradiol}	0.5mg	/images/default-product.png	2025-09-18 19:33:12.653-03	2025-09-18 19:33:12.653-03	14221	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
88845bcb-6604-42b8-b7b1-bbb50e7407f5	2025-09-25 01:15:22.264-03	Some New Product	Some New Product Description	199	{Somethingglutide}	500mg		2025-09-25 01:03:12.699-03	2025-09-25 01:15:22.265-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
6b5f7ab4-0da0-4068-9309-d53cda0b2244	2025-09-25 01:23:32.139-03	Some Product	Some Product Description	133	{Acetaminophen}	500mg		2025-09-25 01:22:45.914-03	2025-09-25 01:23:32.139-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
8ed65a57-5402-4c89-9331-a7dbd1ce1f79	2025-09-25 01:27:51.547-03	Some New Product	Some New Product Desc	133	{}	500mg		2025-09-25 01:24:00.94-03	2025-09-25 01:27:51.548-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
afd0cfa5-7d1d-4fe8-a0b1-10da144a26be	2025-09-25 01:32:31.771-03	Some New	Some New	133	{}	500mg	https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1758774739814-bird.jpg	2025-09-25 01:28:27.097-03	2025-09-25 01:32:31.771-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
a1e9645f-26db-436b-b2f9-85980b100547	\N	Brande New Product	Brande New Product Description	133	{}	500mg	https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1758775118672-bird.jpg	2025-09-25 01:38:37.863-03	2025-09-25 01:38:38.754-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
ef8c8a97-ccae-4e4d-99c6-0444631def31	2025-09-25 01:33:07.178-03	Great Product	Great Product	133	{}		https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1758774779492-bird.jpg	2025-09-25 01:32:58.905-03	2025-09-25 01:33:07.178-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
21b1daa1-7218-47c0-9f60-dc9bb77e3db1	\N	NAD		100	{}	50mg		2025-10-05 18:51:19.6-03	2025-10-05 18:51:19.6-03	432989459	absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
73e95613-4371-40ef-846c-77bbe6463c2c	\N	GlP-1		220	{}	25mg, twice a week		2025-10-05 18:52:39.324-03	2025-10-05 18:52:39.324-03		absoluterx	t	\N	\N	\N	[]	t	\N	\N	\N	\N
48ac0e38-ebc2-476e-a1b8-8e42dc52f51d	\N	Ozempic (with Needle Tips)	WEIGHT LOSS - Pen-Injector - Manufactured	1339	{Ozempic}	4mg / 3mL	/images/default-product.png	2025-09-18 19:33:12.521-03	2025-09-18 19:33:12.521-03	2181	absoluterx	t	\N	\N	weight_loss	[]	t	\N	\N	\N	\N
5800dc14-aba1-4079-bfb9-b22323cbe442	\N	Ozempic (with Needle Tips)	WEIGHT LOSS - Pen-Injector - Manufactured	1339	{Ozempic}	2mg / 3mL	/images/default-product.png	2025-09-18 19:33:12.518-03	2025-09-18 19:33:12.518-03	2180	absoluterx	t	\N	\N	weight_loss	[]	t	\N	\N	\N	\N
550e8400-e29b-41d4-a716-446655440101	\N	Ozempic (Semaglutide Injection)	A GLP-1 receptor agonist that helps regulate appetite and blood sugar, promoting weight loss and improving metabolic health.	900	{Semaglutide}	0.25–2 mg subcutaneous injection weekly	https://example.com/images/ozempic.jpg	2025-09-12 22:57:34.854-03	2025-10-09 22:04:51.806-03	\N	absoluterx	t	\N	\N	weight_loss	[]	t	\N	\N	\N	ozempic-semaglutide-injection
\.


--
-- TOC entry 7338 (class 0 OID 50921)
-- Dependencies: 228
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Question" (id, "deletedAt", "questionText", "answerType", "isRequired", "questionOrder", placeholder, "helpText", "stepId", "createdAt", "updatedAt", "footerNote", "questionSubtype", "conditionalLogic", "subQuestionOrder", "conditionalLevel") FROM stdin;
2269743e-0631-4e7e-8397-fab78bdd3f72	\N	Date of Birth	date	t	1	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
5a6e852b-6733-43c6-a3c8-42793f4fd56d	\N	Sex assigned at birth	radio	t	2	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
df2125a6-3da0-45da-b496-5da9f5faa9a7	\N	Phone Number	phone	t	3	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
44d0682b-31af-450b-87e4-fc814322344d	\N	Zip Code	text	t	4	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
c5a78559-7119-4d28-938b-e71dcf88440c	\N	Height	height	t	1	\N	\N	1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
5e612ca9-eba3-4ebf-b588-90a855d1139f	\N	Weight	weight	t	2	\N	\N	1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
9eaf9682-3de3-4e5b-b002-cad5921c02d3	\N	Have you ever been diagnosed with any of the following?	checkbox	t	1	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
81008033-750c-485f-a5ee-804ddfcddb72	\N	Do you have any allergies? (Food, medications, supplements, dyes, other)	textarea	f	2	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
51f63ea3-3b73-4e80-be9b-0318feda8e19	\N	Please list current medications, herbals, or supplements (Name, dose, reason)	textarea	f	3	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
3b9551a0-98a4-4abb-9692-88c38b66c693	\N	Have you had any recent surgeries or hospitalizations?	radio	t	4	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
af568dc4-b13b-47d3-b039-a2fdb2265d1a	\N	Are you currently pregnant, breastfeeding, or planning pregnancy?	radio	t	5	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	\N	Do you smoke or vape?	radio	t	1	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
893d96c7-e2ef-4902-8c85-714acec7e771	\N	Do you consume alcohol?	radio	t	2	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
4695b661-47a1-4e90-a084-377568871f41	\N	How often do you exercise?	radio	t	3	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
257b17ee-3c74-421d-a2b2-6edfe2faeb00	\N	How would you describe your stress level?	radio	t	4	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
b05e3509-149d-4c5a-a6df-3d29f5a7a186	\N	How many hours of sleep do you typically get?	radio	t	5	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
4a03f66e-3724-479c-8e56-3a33aa70df9e	\N	What are your goals with NAD+ treatment? (Select all that apply)	checkbox	t	1	\N	\N	615e5d08-0e76-4efd-b7b6-6e879ac30358	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03	\N	\N	\N	\N	0
2c94c842-10cf-40c6-802b-26d8e13b8928	\N	Have you ever tried NAD+ before?	radio	t	1	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03	\N	\N	\N	\N	0
efcc28e9-18c6-4ceb-abb6-b5e5e9d5145c	\N	If yes, what benefits did you notice?	textarea	f	2	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03	\N	\N	\N	\N	0
44208bc8-1fe1-4b7e-a5a1-6053e6610f18	\N	If no, what interests you most about NAD+?	textarea	f	3	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03	\N	\N	\N	\N	0
19149d80-8ec6-433b-8e28-22161521fc05	\N	How often are you looking to use NAD+?	radio	t	1	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03	\N	\N	\N	\N	0
22389579-ea11-4476-9031-99c68bc8cfbf	\N	What kind of results are you hoping to achieve in the first 30 days?	checkbox	t	2	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03	\N	\N	\N	\N	0
683a9ef3-e655-4cd9-be8f-33a7c7660ff7	\N	Other results you hope to achieve (optional)	textarea	f	3	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03	\N	\N	\N	\N	0
9c863db3-eeee-4e7e-a956-09481aec7d46	\N	What is your main goal with weight loss medication?	radio	t	1	\N	Please select the primary reason you're seeking treatment.	494573f0-07e4-41cd-96d6-216a8f15aadc	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
b410a34a-6eeb-4134-8dc1-18f7d9401389	\N	Have you tried losing weight before?	radio	t	1	\N	This helps us understand your journey.	8a345b19-211e-49c5-9d81-b7b868f9c537	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	\N	What is the main difficulty you face when trying to lose weight?	radio	t	1	\N	Select the one that applies most to you.	f7f9d3d9-ea39-4103-9b10-644a41f84a1e	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	\N	What state do you live in?	select	t	1	\N	We need to verify our services are available in your location.	fce69cde-4d4c-4465-a251-e929522ba024	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
fda21e98-558b-474b-837f-01611474391d	\N	What's your gender at birth?	radio	t	1	\N	This helps us provide you with personalized care.	54f9762f-a900-4325-a04a-ab5afcec282d	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
c98a86f7-d5d8-4965-a38d-022502ad951a	\N	What's your date of birth?	date	t	1	\N	We need to verify you're at least 18 years old.	ecaa2116-ce93-4bb0-b869-c84f740bdffc	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
ddcdada6-739b-4d4f-a6c1-8c3bb0914fdc	\N	First Name	text	t	1	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
bfbb9599-1eda-44ac-8387-0b83f24c6998	\N	Last Name	text	t	2	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
f3b0e54a-4a37-4d1e-9a5c-62cbffc37320	\N	Email Address	email	t	3	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
1cf8722b-d826-4b0d-8b24-109210be9b9d	\N	Mobile Number (US Only)	phone	t	4	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
a5e32329-80d2-4ae4-acb0-8d3a94273c54	\N	Current Weight (pounds)	number	t	1	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
b0258a7c-2ce9-4da3-8567-51f068f20ac0	\N	Height (feet)	number	t	2	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
b33e5222-2755-4b10-96e2-ce5ede1288c7	\N	Height (inches)	number	t	3	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
a19c5e29-aba2-4a75-94c2-8538df51f23c	\N	Do you have any of these medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	8e41a76d-cb19-4efd-af93-6b1a55242cc3	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
c6f43c4d-f86f-4b24-8beb-2f5833ebb296	\N	Do you have any of these serious medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	d12604a8-5711-4cf4-9946-617c4f12a97c	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
eafa5812-6375-411c-b01a-fbf2df80b2c9	\N	Are you allergic to any of the following?	checkbox	t	1	\N	Select all that apply to help us ensure your safety.	81c71333-a59c-4c63-b6cd-7159c636851d	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
20f6d250-fbbc-488b-b26c-f1c80368f2a0	\N	Are you currently taking any medications?	radio	t	1	\N	Please list all medications, vitamins, and supplements.	54c7c986-ca72-481a-b6f4-c0bc68b595bc	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
e003789e-1383-4e9e-9065-713ae3216a11	\N	Are you currently taking any of the following medications?	checkbox	t	1	\N	Select all that apply.	29165ffd-1067-45a3-b5c9-28209e9865d2	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
9d1e551f-a636-4f99-b6ad-0c435b35999d	\N	Please list all medications, vitamins, and supplements	textarea	f	2	Please list all medications, vitamins, and supplements you are currently taking...	\N	54c7c986-ca72-481a-b6f4-c0bc68b595bc	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	questionOrder:1,answer:Yes, I take medications	\N	0
2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	\N	Which medication WERE YOU LAST ON?	radio	f	2	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	questionOrder:1,answer:Yes, I have taken weight loss medications before.	\N	0
76e875ad-1914-4a24-b1cd-e907bdf0bbea	\N	Goal Weight (pounds)	number	t	1	\N	Enter your target weight in pounds.	4479a22d-7b23-4937-bae3-2f0eff0dbdba	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	<b>You're taking the first step!</b> Our medical team will create a personalized plan\n  based on your goals.	Lbs	\N	\N	0
f1059dae-2daf-442b-ba86-e17917c4b43e	\N	Have you taken weight loss medications before?	radio	t	1	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-17 23:18:06.62-03	2025-09-17 23:18:06.62-03	\N	\N	\N	\N	0
627cc6c0-41a2-4181-9a55-85470b23fb17	\N		textarea	f	24	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:10:01.411803-03	2025-09-19 02:10:01.411803-03	\N	\N	questionOrder:23,answer:Yes	4	2
9149cfe8-1aa7-4a2f-80ee-b74c16e6e914	\N	What dose were you on?	text	f	3	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:36:54.222875-03	2025-09-19 01:36:54.222875-03	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	\N	1
a596dbc1-348b-43df-9aec-85001801f6bd	\N	When did you last take it?	text	f	4	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:39:12.254894-03	2025-09-19 01:39:12.254894-03	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	\N	1
16f3832e-e9e3-4b39-99f6-423f1907f623	\N		textarea	f	9	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:49:06.672662-03	2025-09-19 01:49:06.672662-03	\N	\N	questionOrder:5,answer:Yes	4	2
4f7761ce-95cb-4a5f-92f6-7533206f4822	\N	What dose were you on?	text	f	11	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:54:54.001845-03	2025-09-19 01:54:54.001845-03	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	\N	1
ce1c461a-e062-41bc-8cbc-6c6a86582ccf	\N	When did you last take it?	text	f	12	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:55:10.810652-03	2025-09-19 01:55:10.810652-03	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	\N	1
544ddd65-572d-4b81-8910-b8a052a7ee6f	\N		textarea	f	14	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:52:38.796735-03	2025-09-19 01:52:38.796735-03	\N	\N	questionOrder:13,answer:Yes	4	2
b1de48b4-3a84-410e-a754-dd752269aaa7	\N		textarea	f	22	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:02:29.13368-03	2025-09-19 02:02:29.13368-03	\N	\N	questionOrder:21,answer:Yes	4	2
3698b8cc-91f8-4f60-900f-c9dac8b7a40f	\N	What dose were you on?	text	f	19	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:00:54.991934-03	2025-09-19 02:00:54.991934-03	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	\N	1
83a7a166-ddd4-4ffb-8614-9df92739cf57	\N	When did you last take it?	text	f	20	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:00:54.991934-03	2025-09-19 02:00:54.991934-03	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	\N	1
a0371b68-6e77-4ba1-9c40-686f6af2cf62	\N	What dose were you on?	text	f	25	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:08:47.41765-03	2025-09-19 02:08:47.41765-03	\N	\N	questionOrder:2,answer:Other weight loss medication	1	1
cac7b0cd-f108-4312-9c9c-42c96e4e7fbb	\N	When did you last take it?	text	f	26	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:08:56.401484-03	2025-09-19 02:08:56.401484-03	\N	\N	questionOrder:2,answer:Other weight loss medication	2	1
1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	\N	Did you experience any side effects?	radio	f	5	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:43:23.788211-03	2025-09-19 01:43:23.788211-03	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	3	1
b0fce918-96fb-4012-a1d1-9fe8fe81925f	\N	Did you experience any side effects?	radio	f	13	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 01:51:13.406514-03	2025-09-19 01:51:13.406514-03	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	3	1
93f87772-01fa-4864-a7c6-bf8efc8493f9	\N	Did you experience any side effects?	radio	f	21	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:01:56.978184-03	2025-09-19 02:01:56.978184-03	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	3	1
86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	\N	Did you experience any side effects?	radio	f	23	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 02:09:06.639732-03	2025-09-19 02:09:06.639732-03	\N	\N	questionOrder:2,answer:Other weight loss medication	3	1
64caa933-1ccf-42a2-8e65-822fb534f785	\N	What is your main goal with weight loss medication?	radio	t	1	\N	Please select the primary reason you're seeking treatment.	2448f647-01ec-4f01-941f-e4f3c8935750	2025-10-06 23:51:54.051-03	2025-10-06 23:51:54.051-03	\N	\N	\N	\N	0
f0b36438-7cae-4fb6-880e-00ca5fddddff	\N	Have you tried losing weight before?	radio	t	1	\N	This helps us understand your journey.	846002ca-620a-4578-b621-6af55adef446	2025-10-06 23:51:54.056-03	2025-10-06 23:51:54.056-03	\N	\N	\N	\N	0
65f0b7dd-65b1-4442-8b26-5ecbddc302ef	\N	What is the main difficulty you face when trying to lose weight?	radio	t	1	\N	Select the one that applies most to you.	bb014898-4c5f-4bcc-b273-d6cf6ef58b1e	2025-10-06 23:51:54.058-03	2025-10-06 23:51:54.058-03	\N	\N	\N	\N	0
c3d974a8-32c7-4993-8fe8-e6d2c0404df8	\N	What state do you live in?	select	t	1	\N	We need to verify our services are available in your location.	52bdadb2-f95a-4d00-b480-2d751ef5fd10	2025-10-06 23:51:54.062-03	2025-10-06 23:51:54.062-03	\N	\N	\N	\N	0
f58d7eb3-7e64-4124-aca3-ac34da2a71a6	\N	What's your gender at birth?	radio	t	1	\N	This helps us provide you with personalized care.	7df8d329-3843-4f95-92ac-f5e76255567c	2025-10-06 23:51:54.07-03	2025-10-06 23:51:54.07-03	\N	\N	\N	\N	0
4843f39b-dc31-4b37-8941-782a0ca8b409	\N	What's your date of birth?	date	t	1	\N	We need to verify you're at least 18 years old.	3967f640-aac1-43e8-976f-2db28cc06256	2025-10-06 23:51:54.072-03	2025-10-06 23:51:54.072-03	\N	\N	\N	\N	0
75b70788-bcdc-443b-807d-9772e48d9347	\N	First Name	text	t	1	\N	\N	2b80ed58-5cc1-404d-b04a-1a8e163a83e7	2025-10-06 23:51:54.073-03	2025-10-06 23:51:54.073-03	\N	\N	\N	\N	0
3347d58c-7c53-4b06-af73-9c6457f79a19	\N	Last Name	text	t	2	\N	\N	2b80ed58-5cc1-404d-b04a-1a8e163a83e7	2025-10-06 23:51:54.073-03	2025-10-06 23:51:54.073-03	\N	\N	\N	\N	0
d7f90925-c91b-4375-aec2-ccbcd2a907c7	\N	Email Address	email	t	3	\N	\N	2b80ed58-5cc1-404d-b04a-1a8e163a83e7	2025-10-06 23:51:54.074-03	2025-10-06 23:51:54.074-03	\N	\N	\N	\N	0
0913f820-00b3-4a77-b0d1-20ec6b836089	\N	Mobile Number (US Only)	phone	t	4	\N	\N	2b80ed58-5cc1-404d-b04a-1a8e163a83e7	2025-10-06 23:51:54.075-03	2025-10-06 23:51:54.075-03	\N	\N	\N	\N	0
26db0eed-962d-483c-b43b-1e3e67cf07e0	\N	Current Weight (pounds)	number	t	1	\N	\N	ce55be0b-0722-458a-95de-029869b1892b	2025-10-06 23:51:54.077-03	2025-10-06 23:51:54.077-03	\N	\N	\N	\N	0
86f9c928-1e5f-4d98-a2f7-0886680c2786	\N	Height (feet)	number	t	2	\N	\N	ce55be0b-0722-458a-95de-029869b1892b	2025-10-06 23:51:54.078-03	2025-10-06 23:51:54.078-03	\N	\N	\N	\N	0
ff91d788-2e55-471c-987a-13b19be934d7	\N	Height (inches)	number	t	3	\N	\N	ce55be0b-0722-458a-95de-029869b1892b	2025-10-06 23:51:54.079-03	2025-10-06 23:51:54.079-03	\N	\N	\N	\N	0
a9e8cce6-60b0-4f3d-931c-a93ef30cb064	\N	Goal Weight (pounds)	number	t	1	\N	Enter your target weight in pounds.	5984f0b8-b301-4165-bbf6-a307b29d7a59	2025-10-06 23:51:54.08-03	2025-10-06 23:51:54.08-03	<b>You're taking the first step!</b> Our medical team will create a personalized plan\n  based on your goals.	Lbs	\N	\N	0
0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	\N	Do you have any of these medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	da434768-28bd-4ecd-bbbc-9c31ad6b2542	2025-10-06 23:51:54.081-03	2025-10-06 23:51:54.081-03	\N	\N	\N	\N	0
00e72c06-91f6-4f98-80dc-b76afb5f04e6	\N	Do you have any of these serious medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	b443a272-5fe5-4e5c-97f3-0d682a9dd1c9	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03	\N	\N	\N	\N	0
8b09602c-e82e-4fec-a265-a56a23c2f6fc	\N	Are you allergic to any of the following?	checkbox	t	1	\N	Select all that apply to help us ensure your safety.	7909f5eb-bb86-41e0-bd10-365e49cf8ff2	2025-10-06 23:51:54.088-03	2025-10-06 23:51:54.088-03	\N	\N	\N	\N	0
7d5df539-d98e-441d-b246-672cf096fa7b	\N	Are you currently taking any medications?	radio	t	1	\N	Please list all medications, vitamins, and supplements.	85d4d6bd-fac4-4df9-b977-ac3f55ed9f6e	2025-10-06 23:51:54.09-03	2025-10-06 23:51:54.09-03	\N	\N	\N	\N	0
6ec4d490-3bea-46a1-8f9a-9ab32dd2fa68	\N	Please list all medications, vitamins, and supplements	textarea	f	2	Please list all medications, vitamins, and supplements you are currently taking...	\N	85d4d6bd-fac4-4df9-b977-ac3f55ed9f6e	2025-10-06 23:51:54.091-03	2025-10-06 23:51:54.091-03	\N	\N	questionOrder:1,answer:Yes, I take medications	\N	0
1b26c9e0-adcc-4efc-a59a-7300fdefad79	\N	Are you currently taking any of the following medications?	checkbox	t	1	\N	Select all that apply.	eab2e442-34a8-4cc7-a9e9-3f7e8a433561	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03	\N	\N	\N	\N	0
149f5f26-5c2b-429c-81b5-ce4a5f4927e8	\N	Which medication WERE YOU LAST ON?	radio	f	2	\N	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.097-03	2025-10-06 23:51:54.097-03	\N	\N	questionOrder:1,answer:Yes, I have taken weight loss medications before.	\N	0
b535ebbc-3df8-4801-83b7-d0b3e730f16a	\N	Have you taken weight loss medications before?	radio	t	1	\N	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.099-03	2025-10-06 23:51:54.099-03	\N	\N	\N	\N	0
7fb50deb-906b-4b74-8f11-942c41fa0543	\N		textarea	f	24	Please describe any side effects you experienced (optional)...	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.1-03	2025-10-06 23:51:54.1-03	\N	\N	questionOrder:23,answer:Yes	4	2
6b67a3b7-58ab-4f01-9feb-0322cf4893bf	\N	What dose were you on?	text	f	3	1mg weekly	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.1-03	2025-10-06 23:51:54.1-03	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	\N	1
7c5ac8ca-bee5-400a-b10c-97b8f1dd1cfd	\N	When did you last take it?	text	f	4	eg: 2 months ago, last week	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.101-03	2025-10-06 23:51:54.101-03	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	\N	1
41a76c87-7b74-47d4-bf29-be464f96c362	\N		textarea	f	9	Please describe any side effects you experienced (optional)...	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.102-03	2025-10-06 23:51:54.102-03	\N	\N	questionOrder:5,answer:Yes	4	2
91e7ce18-6807-43db-8dfb-35fd89cb5fb6	\N	What dose were you on?	text	f	11	1mg weekly	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.102-03	2025-10-06 23:51:54.102-03	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	\N	1
8c561c0e-5adb-4ee5-88fc-d3189cf74288	\N	When did you last take it?	text	f	12	eg: 2 months ago, last week	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.103-03	2025-10-06 23:51:54.103-03	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	\N	1
9ececa00-06be-4b20-93d5-7b5a0ed8e5da	\N		textarea	f	14	Please describe any side effects you experienced (optional)...	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.103-03	2025-10-06 23:51:54.103-03	\N	\N	questionOrder:13,answer:Yes	4	2
35906174-5127-4fb9-9b28-b4464c64cc25	\N		textarea	f	22	Please describe any side effects you experienced (optional)...	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.104-03	2025-10-06 23:51:54.104-03	\N	\N	questionOrder:21,answer:Yes	4	2
3403b709-3afc-429a-a57a-e0ce9fe0d64c	\N	What dose were you on?	text	f	19	1mg weekly	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.104-03	2025-10-06 23:51:54.104-03	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	\N	1
2b1d7d74-29b8-45a0-af99-9417089af8de	\N	When did you last take it?	text	f	20	eg: 2 months ago, last week	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.105-03	2025-10-06 23:51:54.105-03	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	\N	1
22d454ec-25bd-4f7f-a239-2a0db135db35	\N	What dose were you on?	text	f	25	1mg weekly	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.106-03	2025-10-06 23:51:54.106-03	\N	\N	questionOrder:2,answer:Other weight loss medication	1	1
200d7b01-e68a-498b-b057-dd9386916fd9	\N	When did you last take it?	text	f	26	eg: 2 months ago, last week	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.113-03	2025-10-06 23:51:54.113-03	\N	\N	questionOrder:2,answer:Other weight loss medication	2	1
75f6b467-05a7-48e0-8bd4-9e7b991e1084	\N	Did you experience any side effects?	radio	f	5	\N	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.114-03	2025-10-06 23:51:54.114-03	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)	3	1
40080132-5685-4d6a-9fce-dda35a198d32	\N	Did you experience any side effects?	radio	f	13	\N	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.115-03	2025-10-06 23:51:54.115-03	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)	3	1
d71c5d35-f5a2-4575-a426-ae6a51f80662	\N	Did you experience any side effects?	radio	f	21	\N	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.116-03	2025-10-06 23:51:54.116-03	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)	3	1
6aa81f33-1561-4e62-9ff3-2ef8764ef922	\N	Did you experience any side effects?	radio	f	23	\N	\N	2f484d0a-0f72-40f1-9273-038f33d492ca	2025-10-06 23:51:54.116-03	2025-10-06 23:51:54.116-03	\N	\N	questionOrder:2,answer:Other weight loss medication	3	1
9a58d2cb-7adb-41cc-a8ac-8e98a8c7c416	\N	Have you tried weight loss before ?	select	t	1	\N	\N	7d18af7f-6d56-4ec4-99df-215ce8b00dd1	2025-10-08 17:41:09.858-03	2025-10-08 17:42:05.764-03	\N	\N	\N	\N	0
c371e6a1-c461-44ab-981b-bcdadfa9ffe0	2025-10-08 22:33:17.419-03	New question	select	t	1	\N	\N	1479b82d-d14b-496e-9200-9a4882533034	2025-10-08 22:33:02.995-03	2025-10-08 22:33:02.995-03	\N	\N	\N	\N	0
4bde4b19-f04c-43e5-87e2-36e692710a7e	2025-10-08 23:19:58.373-03	New question	select	t	1	\N	\N	0b9e59f5-a37d-493f-a90e-4510b3564a94	2025-10-08 23:19:37.103-03	2025-10-08 23:19:37.103-03	\N	\N	\N	\N	0
1b695713-dfbd-4902-bc28-808f98fddab0	2025-10-08 23:20:41.927-03	New question	select	t	1	\N	\N	c8c752ff-91de-4372-94c9-515ed7e760ad	2025-10-08 23:20:26.54-03	2025-10-08 23:20:26.54-03	\N	\N	\N	\N	0
1f0d577f-2987-4485-8233-769125306d65	2025-10-08 23:25:51.106-03	New question	select	t	1	\N	\N	105d853c-7637-4d8f-ac6c-acac7a8a233b	2025-10-08 23:21:04.826-03	2025-10-08 23:21:04.826-03	\N	\N	\N	\N	0
c9c4b3ba-1390-4f8e-8a13-875fd3d40fe4	\N	New question	select	t	1	\N	\N	c7f1bf06-741d-4d75-a3d9-575c4ae72268	2025-10-08 23:26:32.08-03	2025-10-08 23:26:32.08-03	\N	\N	\N	\N	0
\.


--
-- TOC entry 7339 (class 0 OID 50928)
-- Dependencies: 229
-- Data for Name: QuestionOption; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."QuestionOption" (id, "deletedAt", "optionText", "optionValue", "optionOrder", "questionId", "createdAt", "updatedAt") FROM stdin;
b1e33cd7-0542-4a93-a75d-7df9de937787	\N	Male	male	1	5a6e852b-6733-43c6-a3c8-42793f4fd56d	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
b57eb716-0260-45df-b63e-d794dd6a361b	\N	Female	female	2	5a6e852b-6733-43c6-a3c8-42793f4fd56d	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
121b14b5-26ae-48fa-8cf0-c25b04789bdb	\N	Other	other	3	5a6e852b-6733-43c6-a3c8-42793f4fd56d	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
529068e9-89c5-4ed4-9ee8-97b0e2938ac8	\N	Stroke	stroke	1	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
3eda4dd8-83d8-4e8f-98ea-155686549e0d	\N	Heart Disease	heart_disease	2	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
6f0930e7-1454-4dda-bc8a-7c064ca937e8	\N	High Blood Pressure	high_blood_pressure	3	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
1085b546-cc5f-4940-912a-ded83cfd2e2f	\N	Diabetes	diabetes	4	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
503b5009-6519-423b-98ea-112b5555c006	\N	Seizures	seizures	5	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
93cb92e3-fddc-4b9b-890e-3e9a03910352	\N	Fatty Liver	fatty_liver	6	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
5948e09f-ad4a-4e18-a022-5fe37ebb0102	\N	Gallstones	gallstones	7	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
3c117e84-1d81-4991-bac2-ed6b4547a3b8	\N	Obstructive Sleep Apnea	obstructive_sleep_apnea	8	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
ae79ab93-d86e-40f7-b9ed-eb846342627a	\N	Kidney Disease	kidney_disease	9	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
a388aaf2-e574-455c-9d3f-bf7771970bc6	\N	Cancer	cancer	10	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
5f9d7556-bb4e-4dd9-aca4-4a3cd6650565	\N	None	none	11	9eaf9682-3de3-4e5b-b002-cad5921c02d3	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
5ce04bc6-5929-439d-a797-1f87293cf67f	\N	Yes	yes	1	3b9551a0-98a4-4abb-9692-88c38b66c693	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
58e56af7-37b5-4258-b2dc-27d7b2a4f5a6	\N	No	no	2	3b9551a0-98a4-4abb-9692-88c38b66c693	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
c7cffdac-5346-4978-b77f-4a345b91e2cb	\N	Yes	yes	1	af568dc4-b13b-47d3-b039-a2fdb2265d1a	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
fa233792-9892-4cb4-8e57-1bdb71cd634e	\N	No	no	2	af568dc4-b13b-47d3-b039-a2fdb2265d1a	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
58dff435-6156-430e-84ff-9935d8f88f39	\N	Yes	yes	1	08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
45a9ca03-4f6d-4fb4-9370-76554fffe9b6	\N	No	no	2	08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
aa568d79-8760-456f-ad2a-451fdbfaddca	\N	Yes	yes	1	893d96c7-e2ef-4902-8c85-714acec7e771	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
5bc683ee-6017-4f3d-a9f5-32c5783b625d	\N	Occasionally	occasionally	2	893d96c7-e2ef-4902-8c85-714acec7e771	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
ecd28f7c-66c7-4fb8-aea2-99a2801ee5a3	\N	No	no	3	893d96c7-e2ef-4902-8c85-714acec7e771	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
35d6f55a-e82b-4365-af3e-61044c5dab53	\N	Daily	daily	1	4695b661-47a1-4e90-a084-377568871f41	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
d1f23c05-f36c-4d3e-971f-fe74b9afbf17	\N	Few times a week	few_times_a_week	2	4695b661-47a1-4e90-a084-377568871f41	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
8f7de0fd-dbf2-4d92-82c3-70041715bb95	\N	Rarely	rarely	3	4695b661-47a1-4e90-a084-377568871f41	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
51854dbd-7f6f-4baa-a2d7-f3013f552d5a	\N	Never	never	4	4695b661-47a1-4e90-a084-377568871f41	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
841d5b66-e14a-4ddf-bf94-f5b615cfd423	\N	Low	low	1	257b17ee-3c74-421d-a2b2-6edfe2faeb00	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
d50f98a6-a393-4292-b2b2-05c871d5f2ed	\N	Moderate	moderate	2	257b17ee-3c74-421d-a2b2-6edfe2faeb00	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
af95f651-c034-431d-bcfc-6138e9ceff86	\N	High	high	3	257b17ee-3c74-421d-a2b2-6edfe2faeb00	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
83e8582f-a7aa-4807-ab9d-d3eb17cc89e0	\N	<5 hours	5	1	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
0aa7cc37-66f8-4f33-8a93-7f38a9d77d46	\N	5–7 hours	57	2	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
76460de9-ce9e-48ad-921b-a7e972c497a1	\N	7–9 hours	79	3	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
0558729d-44f5-482e-bed2-2ec9c110c5a0	\N	>9 hours	9	4	b05e3509-149d-4c5a-a6df-3d29f5a7a186	2025-09-12 22:03:17.627-03	2025-09-12 22:03:17.627-03
b89c3312-2a3d-4314-bd7f-f4451bce5a92	\N	To boost daily energy and reduce fatigue	to_boost_daily_energy_and_reduce_fatigue	1	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
d9fee3a3-f30c-493d-a9f1-db8395bffdc9	\N	To improve focus, memory, and mental clarity	to_improve_focus_memory_and_mental_clarity	2	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
de027da5-0caf-4b59-9d32-e4de03f7986e	\N	To support healthy aging / longevity	to_support_healthy_aging_longevity	3	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
13affe09-3281-4ba2-a918-4b3a9a903b9f	\N	To restore cellular health and repair DNA	to_restore_cellular_health_and_repair_dna	4	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
e15f9c5f-9f8a-4b3f-b360-016cfb3dc501	\N	To speed up recovery from stress or overexertion	to_speed_up_recovery_from_stress_or_overexertion	5	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
234e5510-a982-4541-8a6f-971ea8534c85	\N	To stabilize mood and emotional balance	to_stabilize_mood_and_emotional_balance	6	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
99cca921-0abf-4c9c-94bc-f64489782a9c	\N	To improve metabolism and weight management	to_improve_metabolism_and_weight_management	7	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
35687ffe-57d8-4356-b506-653dca9bc5db	\N	To improve sleep quality	to_improve_sleep_quality	8	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
74ea2f3b-4437-4ab3-80b5-048ebf55537a	\N	To detox and support overall wellness	to_detox_and_support_overall_wellness	9	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
12880ed7-0452-4672-b05e-4a3c0e94cd65	\N	To feel good and function at my best	to_feel_good_and_function_at_my_best	10	4a03f66e-3724-479c-8e56-3a33aa70df9e	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
b9a2b2d7-a615-4f3b-a3f4-1212b12a1def	\N	Yes	yes	1	2c94c842-10cf-40c6-802b-26d8e13b8928	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
7c35bc19-ef18-4151-9d19-36a4e151a672	\N	No	no	2	2c94c842-10cf-40c6-802b-26d8e13b8928	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
f0224e2e-a8de-4556-b33b-c788b77b41b8	\N	One-time session (trial)	onetime_session_trial	1	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
b088da41-7e45-4265-998e-7f7e399b0d77	\N	Monthly maintenance	monthly_maintenance	2	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
3ec5b44e-e68a-4c8c-91d5-c385af97dce4	\N	Bi-weekly optimization	biweekly_optimization	3	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
35a65d94-db81-4595-ac98-e6c59647aae4	\N	Weekly peak results	weekly_peak_results	4	19149d80-8ec6-433b-8e28-22161521fc05	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
48938806-a65b-4f3e-81ec-1fdf5a1ca73f	\N	More energy + focus	more_energy_focus	1	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
7ff2b0b3-6a49-4cbc-9f97-27e8e2eba3e2	\N	Better sleep + recovery	better_sleep_recovery	2	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
9775aa4b-d3d6-40de-9a87-007235630224	\N	Longevity + anti-aging support	longevity_antiaging_support	3	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
e460ba82-c67a-4ddb-8f22-69ff80efabb4	\N	Mood + stress balance	mood_stress_balance	4	22389579-ea11-4476-9031-99c68bc8cfbf	2025-09-12 22:03:17.628-03	2025-09-12 22:03:17.628-03
5a9ea665-032e-4138-9c4c-e3b0c0282ad5	\N	Improve health	Improve health	1	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
61ab98d7-88a2-4180-b22f-a312c16652c1	\N	Feel better about myself	Feel better about myself	2	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1be6cad8-f506-4228-af47-21a5843fdb45	\N	Improve quality of life	Improve quality of life	3	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
76e2956a-d872-4093-b0f6-a2d2cd66a8bb	\N	All of the above	All of the above	4	9c863db3-eeee-4e7e-a956-09481aec7d46	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
8275e6ed-68a8-4015-bc11-de033fb41a25	\N	Yes, I have tried diets, exercises, or other methods.	Yes, I have tried diets, exercises, or other methods.	1	b410a34a-6eeb-4134-8dc1-18f7d9401389	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d18fb688-f307-46e0-b137-c829fe207045	\N	No, this is my first time actively trying to lose weight.	No, this is my first time actively trying to lose weight.	2	b410a34a-6eeb-4134-8dc1-18f7d9401389	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
3478facc-2116-4519-923b-97fc9771aa76	\N	Dealing with hunger/cravings	Dealing with hunger/cravings	1	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c117f798-8aea-4157-ab61-e066a746805f	\N	Not knowing what to eat	Not knowing what to eat	2	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
a85c516d-96e3-4fd4-9862-9c4d18f5dc34	\N	It was taking too long	It was taking too long	3	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
02e0754a-f1c6-4ff5-9cac-156b9cbd8e89	\N	Not staying motivated	Not staying motivated	4	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5f137878-fa65-4a0f-85ef-f943fce66696	\N	All of the above	All of the above	5	a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c2c902f6-e07f-464c-aff8-e1af39e503a5	\N	Alabama	Alabama	1	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
27480e68-f410-4be5-8c46-9780cac89630	\N	Alaska	Alaska	2	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
64e4e96e-6b8f-4176-96c6-3bfc1b94b7df	\N	Arizona	Arizona	3	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
76556884-4191-4b6f-b3a7-7a8166e0573f	\N	Arkansas	Arkansas	4	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
486e9898-28fb-41cd-9ce9-b7dbdf889601	\N	California	California	5	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1a278ffb-9c1e-4dae-8dba-6dab7886004f	\N	Colorado	Colorado	6	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
3cbc3a18-7582-4503-a0e0-c4a8ccecfed6	\N	Connecticut	Connecticut	7	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
13dc130b-daea-4c0d-96d7-487117c3b04e	\N	Delaware	Delaware	8	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9c55281b-9f17-44f0-9b9d-2cc11459004a	\N	Florida	Florida	9	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
7233f7cf-973a-4d76-bf22-a7ae14650461	\N	Georgia	Georgia	10	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
f694f532-2d82-4ff4-a958-2cfd27904813	\N	Hawaii	Hawaii	11	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
b8cccbb5-651b-43ac-bc69-5d2091eb28cc	\N	Idaho	Idaho	12	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1bdf87de-a5db-4f88-8bd6-2660e33430be	\N	Illinois	Illinois	13	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c4c955d7-8f1c-43c4-8b60-1d9187835863	\N	Indiana	Indiana	14	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
79a7bcf7-827b-4870-b863-45d80d233089	\N	Iowa	Iowa	15	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
853744b3-92ff-4531-865b-d25aea4c3ba7	\N	Kansas	Kansas	16	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
66f6da19-96ab-4816-ab8a-5b53f80811b5	\N	Kentucky	Kentucky	17	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
fee0a89c-6bb9-43f4-9519-cd8d551f75d9	\N	Louisiana	Louisiana	18	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
ce671169-bbfb-41ad-984b-07c90ea75373	\N	Maine	Maine	19	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c1f0286b-0a18-4530-8cf4-266840c0bcb6	\N	Maryland	Maryland	20	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
aef5597b-b106-4144-abff-f69cca82ccfc	\N	Massachusetts	Massachusetts	21	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
bef9a05b-0e13-4199-93f2-d68d64cbce76	\N	Michigan	Michigan	22	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
8ac4ea8b-0795-4548-b515-59a220d25799	\N	Minnesota	Minnesota	23	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
cd70f5b3-cba6-4ec7-8df4-f8e07303f468	\N	Mississippi	Mississippi	24	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
f2ed3c04-1bc8-4c12-b393-ea27fd7cdbcb	\N	Missouri	Missouri	25	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
61fc001e-ea04-4e8a-a792-d814b715904d	\N	Montana	Montana	26	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6c175917-5bfd-4df8-b459-0ab2ec452a35	\N	Nebraska	Nebraska	27	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d4fb410e-c6da-4252-bf4e-07f6c12576b2	\N	Nevada	Nevada	28	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
ef903b21-efe8-4938-8ab8-ae931b5970f6	\N	New Hampshire	New Hampshire	29	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1386acb4-749e-409f-8d06-67f17c4ec03f	\N	New Jersey	New Jersey	30	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c2a14071-00ec-469f-a707-02fbcfa83d4b	\N	New Mexico	New Mexico	31	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
594a4236-cd37-4c5b-ad38-4b679dc7db88	\N	New York	New York	32	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
03325e8c-2f55-4cb9-bdeb-a82cb5b576a8	\N	North Carolina	North Carolina	33	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
287054c0-fb6f-4b4d-90f0-95f500dd93ec	\N	North Dakota	North Dakota	34	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
34c7ebea-24bd-433c-ae9c-8385d5f8fc94	\N	Ohio	Ohio	35	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
955d39bd-17fd-4700-9b77-796bc2d9c5a8	\N	Oklahoma	Oklahoma	36	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
7e9b6ad6-7cb7-4f72-ba98-662bb0c29e7c	\N	Oregon	Oregon	37	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
4a0c1c16-2f2c-45dd-bff2-cbd61677d0f2	\N	Pennsylvania	Pennsylvania	38	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
8cae91a4-c1c7-49c6-a93f-7b544e9d8014	\N	Rhode Island	Rhode Island	39	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
a297cfd0-f1b7-4c97-9eb3-03b18a1856ee	\N	South Carolina	South Carolina	40	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6130bf70-c356-4c79-8c50-8c32c1181939	\N	South Dakota	South Dakota	41	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
00226523-18c3-4652-bba6-7b582038bb55	\N	Tennessee	Tennessee	42	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
4190e39c-0f06-49c8-a2ae-b41f97ffa1db	\N	Texas	Texas	43	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
b736a428-9e14-4caf-8d02-9a48dff4f5a2	\N	Utah	Utah	44	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c7216177-e0d8-435c-af85-2d52b0ee5c46	\N	Vermont	Vermont	45	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5c7f7f1a-f8c0-47bf-ace9-9f5bdb7bc38a	\N	Virginia	Virginia	46	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5bc28b5d-a4d5-4530-807f-c04ffc66e409	\N	Washington	Washington	47	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6440cf80-7602-4270-9b89-91e56794afdd	\N	West Virginia	West Virginia	48	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
027eb892-d496-4788-9422-402b4ec9e8fc	\N	Wisconsin	Wisconsin	49	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
b613a132-7f22-4bf1-899a-ee222132245c	\N	Wyoming	Wyoming	50	74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6a3408e9-1241-4fa4-833d-9a373c14273e	\N	Male	Male	1	fda21e98-558b-474b-837f-01611474391d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d7d95218-83b7-4d64-bf2a-3284612fb7d5	\N	Female	Female	2	fda21e98-558b-474b-837f-01611474391d	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
773a2b2a-334d-4c6d-9e4d-d4486954afdb	\N	None of the above	None of the above	1	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5093f753-3fd5-4a59-9044-5658cd026d97	\N	Gallbladder disease or removal	Gallbladder disease or removal	2	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
88d90152-5831-4c75-a576-0d32955a7411	\N	Hypertension	Hypertension	3	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
8065f32f-9ac6-4bce-b5e4-7bdb87abea97	\N	High cholesterol or triglycerides	High cholesterol or triglycerides	4	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6e98c26f-a8e7-4651-850a-5bac8f5bc702	\N	Sleep apnea	Sleep apnea	5	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d5a64ba0-3ef9-4c4b-bf55-d60d6c29225b	\N	Osteoarthritis	Osteoarthritis	6	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
b887ecc0-6cfa-4c65-9368-24683c780529	\N	Mobility issues due to weight	Mobility issues due to weight	7	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9859f52a-742a-4ba9-bf43-63a3ff8adf2e	\N	GERD	GERD	8	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d56b5a5d-2cd1-4bb4-b5ae-8e4a74a4a612	\N	PCOS with insulin resistance	PCOS with insulin resistance	9	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
77d8f024-e554-49fc-a139-be8df68753d1	\N	Liver disease or NAFLD	Liver disease or NAFLD	10	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c24d8762-1ff9-45d7-987d-14d13aa86d29	\N	Heart disease	Heart disease	11	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
a3131639-cb0f-4db2-b678-52671ac6d234	\N	Metabolic syndrome	Metabolic syndrome	12	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
da3af391-34b5-411b-bf58-b25343a84852	\N	Chronic kidney disease (Stage 3+)	Chronic kidney disease (Stage 3+)	13	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c8669e1e-a485-4ea8-b04d-0e150467589f	\N	SIADH	SIADH	14	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9f38c4a2-a264-46cd-86b7-e1ed58545c50	\N	Thyroid conditions	Thyroid conditions	15	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d8764054-8dd9-4a1e-9211-abd937cd528b	\N	Prediabetes	Prediabetes	16	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
e1b57e4c-73a1-4e7c-985a-6253d4a14e94	\N	Type 2 diabetes	Type 2 diabetes	17	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
ebe464c5-fa94-4b01-9cbb-b74ce189d025	\N	Gastroparesis	Gastroparesis	18	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
69ce1933-68c8-42fc-b26e-466b52072c2a	\N	IBD (Crohn's or Colitis)	IBD (Crohn's or Colitis)	19	a19c5e29-aba2-4a75-94c2-8538df51f23c	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
2a07913b-94ef-4d3b-925f-ed0655242a22	\N	None of the above	None of the above	1	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
e3bd6072-ab5c-4be5-be47-00f385d0cb54	\N	Gastroparesis (Paralysis of your intestines)	Gastroparesis (Paralysis of your intestines)	2	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
41c44967-fd52-4cfc-afe2-ee2db55ff303	\N	Triglycerides over 600 at any point	Triglycerides over 600 at any point	3	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
666bcce8-b69e-469f-9069-e07444fb6e30	\N	Pancreatic cancer	Pancreatic cancer	4	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5ea86b44-0dc9-4357-9a7d-04dc60bb7d91	\N	Pancreatitis	Pancreatitis	5	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6e3edeae-4cb9-4078-9850-3cb0a80e36f6	\N	Type 1 Diabetes	Type 1 Diabetes	6	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1fef9d60-8a08-4984-8632-ecee03b82171	\N	Hypoglycemia (low blood sugar)	Hypoglycemia (low blood sugar)	7	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5a63d424-3371-4afa-8ac3-787277a4239a	\N	Insulin-dependent diabetes	Insulin-dependent diabetes	8	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
c7e40d4f-3f8c-4a3f-bfb5-4637bf2c58f6	\N	Thyroid cancer	Thyroid cancer	9	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
82b49055-b7e9-4ac8-b648-8b56cd7165cd	\N	Family history of thyroid cancer	Family history of thyroid cancer	10	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
cdbf19d5-cd1e-46de-8f7c-c83d533c0380	\N	Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome	Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome	11	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1ea8ec6c-30aa-4fff-bef7-d1f2e64c55ca	\N	Anorexia or bulimia	Anorexia or bulimia	12	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
fc70cb4a-a57e-49e8-9ea2-63175d81131c	\N	Current symptomatic gallstones	Current symptomatic gallstones	13	c6f43c4d-f86f-4b24-8beb-2f5833ebb296	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
77d0d1f5-d29c-46e7-aa29-74919854acaf	\N	None of the above	None of the above	1	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
ef482d5c-42f6-403a-949f-ec844d7528c7	\N	Ozempic (Semaglutide)	Ozempic (Semaglutide)	2	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
de1cfbea-c413-492e-8625-d0e94a207dd7	\N	Wegovy (Semaglutide)	Wegovy (Semaglutide)	3	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9e6bfb4d-14ed-4099-b81f-61da175306d8	\N	Zepbound (Tirzepatide)	Zepbound (Tirzepatide)	4	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
15c35b35-47ff-401c-a23f-c09e3d2d8d20	\N	Mounjaro (Tirzepatide)	Mounjaro (Tirzepatide)	5	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
87e9853b-9ceb-4253-b6b3-d25e3c0c4ee0	\N	Saxenda (Liraglutide)	Saxenda (Liraglutide)	6	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
cf7b2b94-64dd-4525-907d-efb7e4efce2f	\N	Trulicity (Dulaglutide)	Trulicity (Dulaglutide)	7	eafa5812-6375-411c-b01a-fbf2df80b2c9	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9ff06138-b75a-4e51-80b9-012a177998e3	\N	No, I don't take any medications	No, I don't take any medications	1	20f6d250-fbbc-488b-b26c-f1c80368f2a0	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
e1a6851b-07d0-47f0-8de4-a0ceac100690	\N	Yes, I take medications	Yes, I take medications	2	20f6d250-fbbc-488b-b26c-f1c80368f2a0	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
f9ffd7ab-9e7c-4e45-8d3c-7ce539af043f	\N	None of the above	None of the above	1	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
60914b2a-3b0e-46be-a9dc-9cb7fb01b5a3	\N	Insulin	Insulin	2	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
d6c4eb64-4b08-4199-a958-b4d91dc73b3f	\N	Glimepiride (Amaryl)	Glimepiride (Amaryl)	3	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
e2fe1638-a7af-4054-9bbe-2e170d742338	\N	Meglitinides (e.g., repaglinide, nateglinide)	Meglitinides (e.g., repaglinide, nateglinide)	4	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9e559f02-0b14-419c-ba0e-75c6536da6e3	\N	Glipizide	Glipizide	5	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
3bef8f7e-ae1e-48b9-ba47-d4c7354a1080	\N	Glyburide	Glyburide	6	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
6b808984-91c1-4ce9-b59e-c1c66186e1b4	\N	Sitagliptin	Sitagliptin	7	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
09ea5860-c813-4c53-a816-deb4855f8177	\N	Saxagliptin	Saxagliptin	8	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
24a28461-0b12-4eb0-a0ff-ae8bba91e37c	\N	Linagliptin	Linagliptin	9	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
9fec6d9f-a14c-423f-8dee-e22bbf0de67a	\N	Alogliptin	Alogliptin	10	e003789e-1383-4e9e-9065-713ae3216a11	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
701b785c-d128-4120-bb68-0c5ed5c8b429	\N	No, I haven't taken weight loss medications	No, I haven't taken weight loss medications	1	f1059dae-2daf-442b-ba86-e17917c4b43e	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
366abd0b-30dd-4c7f-b946-0bc018608ccd	\N	Yes, I have taken weight loss medications before.	Yes, I have taken weight loss medications before.	2	f1059dae-2daf-442b-ba86-e17917c4b43e	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
1684cc20-1a95-40a6-bca0-b200cac35201	\N	Semaglutide (Ozempic, Wegovy)	Semaglutide (Ozempic, Wegovy)	1	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
acd4c92f-4cbb-4545-bdc5-68656979c062	\N	Liraglutide (Saxenda, Victoza)	Liraglutide (Saxenda, Victoza)	2	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
0280713c-f383-49ff-b76b-33e7135902ca	\N	Tirzepatide (Mounjaro, Zepbound)	Tirzepatide (Mounjaro, Zepbound)	3	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
5fc6d013-3e3c-4aed-b9a4-e0266444cb4d	\N	Other weight loss medication	Other weight loss medication	4	2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	2025-09-17 23:44:25.791-03	2025-09-17 23:44:25.791-03
0f9b0bab-feb8-40c9-8b61-d27164b309c4	\N	Yes	Yes	1	1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	2025-09-19 01:46:07.288682-03	2025-09-19 01:46:07.288682-03
2c8fdcc8-4d0d-452f-bf92-d7f708f406f1	\N	No	No	2	1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	2025-09-19 01:46:20.885227-03	2025-09-19 01:46:20.885227-03
41593e20-beb7-43a4-864e-07f8237259b3	\N	Yes	Yes	1	b0fce918-96fb-4012-a1d1-9fe8fe81925f	2025-09-19 01:52:38.796735-03	2025-09-19 01:52:38.796735-03
7c4094e5-6cbb-41bf-8c3a-1e4fddfde314	\N	No	No	2	b0fce918-96fb-4012-a1d1-9fe8fe81925f	2025-09-19 01:52:38.796735-03	2025-09-19 01:52:38.796735-03
5bbf9bea-9159-4411-98d2-be4b50e16ba9	\N	Yes	Yes	1	93f87772-01fa-4864-a7c6-bf8efc8493f9	2025-09-19 02:02:29.13368-03	2025-09-19 02:02:29.13368-03
52e82037-7870-47a9-85ea-fb859124c279	\N	No	No	2	93f87772-01fa-4864-a7c6-bf8efc8493f9	2025-09-19 02:02:29.13368-03	2025-09-19 02:02:29.13368-03
306ff91f-49e0-40cd-924b-b02d403ab04f	\N	Yes	Yes	1	86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	2025-09-19 02:10:01.411803-03	2025-09-19 02:10:01.411803-03
48aff6c6-741a-415a-8a15-54d86192b4e8	\N	No	No	2	86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	2025-09-19 02:10:01.411803-03	2025-09-19 02:10:01.411803-03
0b1883c0-35f9-4bb2-9e36-536a230e6442	\N	Improve health	Improve health	1	64caa933-1ccf-42a2-8e65-822fb534f785	2025-10-06 23:51:54.052-03	2025-10-06 23:51:54.052-03
4b1a12ac-e15a-486a-a465-05261415f286	\N	Feel better about myself	Feel better about myself	2	64caa933-1ccf-42a2-8e65-822fb534f785	2025-10-06 23:51:54.052-03	2025-10-06 23:51:54.052-03
fff89761-0049-4ab7-be95-69f0cdac8489	\N	Improve quality of life	Improve quality of life	3	64caa933-1ccf-42a2-8e65-822fb534f785	2025-10-06 23:51:54.052-03	2025-10-06 23:51:54.052-03
5b56a2e7-45fe-437c-ab18-c749a2546c5c	\N	All of the above	All of the above	4	64caa933-1ccf-42a2-8e65-822fb534f785	2025-10-06 23:51:54.052-03	2025-10-06 23:51:54.052-03
76412b5a-00f5-4b77-9978-5f0c680a1232	\N	Yes, I have tried diets, exercises, or other methods.	Yes, I have tried diets, exercises, or other methods.	1	f0b36438-7cae-4fb6-880e-00ca5fddddff	2025-10-06 23:51:54.056-03	2025-10-06 23:51:54.056-03
f61c9d57-b9b7-4c1d-aa4c-3921449ad377	\N	No, this is my first time actively trying to lose weight.	No, this is my first time actively trying to lose weight.	2	f0b36438-7cae-4fb6-880e-00ca5fddddff	2025-10-06 23:51:54.056-03	2025-10-06 23:51:54.056-03
2a0e6b73-dbe6-4e78-a201-6577c76518d8	\N	Dealing with hunger/cravings	Dealing with hunger/cravings	1	65f0b7dd-65b1-4442-8b26-5ecbddc302ef	2025-10-06 23:51:54.059-03	2025-10-06 23:51:54.059-03
984686bb-5621-4b9b-ba6d-0eea9242ac2c	\N	Not knowing what to eat	Not knowing what to eat	2	65f0b7dd-65b1-4442-8b26-5ecbddc302ef	2025-10-06 23:51:54.059-03	2025-10-06 23:51:54.059-03
49b137ba-6a75-49da-bd8e-459630d3a9c6	\N	It was taking too long	It was taking too long	3	65f0b7dd-65b1-4442-8b26-5ecbddc302ef	2025-10-06 23:51:54.059-03	2025-10-06 23:51:54.059-03
41b0631e-7dba-43a3-9cdc-734706927851	\N	Not staying motivated	Not staying motivated	4	65f0b7dd-65b1-4442-8b26-5ecbddc302ef	2025-10-06 23:51:54.059-03	2025-10-06 23:51:54.059-03
02b6e85a-c4d9-40e0-96bb-2c631f811ea3	\N	All of the above	All of the above	5	65f0b7dd-65b1-4442-8b26-5ecbddc302ef	2025-10-06 23:51:54.059-03	2025-10-06 23:51:54.059-03
0854cacb-83f2-4f3b-ad66-87b5137723c5	\N	Alabama	Alabama	1	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
8fd55597-d108-475d-89a6-4645b316d6f8	\N	Alaska	Alaska	2	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
a2bec4e5-f05d-4769-b7d2-53fc41da6dba	\N	Arizona	Arizona	3	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
1feb9b46-cd53-47c2-b703-2a24e685c359	\N	Arkansas	Arkansas	4	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
1f03f024-aa0b-4d6f-be86-7cb130d9c199	\N	California	California	5	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
a301995f-29ed-4fd3-8b1a-f23ad86d2e32	\N	Colorado	Colorado	6	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
888e4353-df22-46ad-a9b3-56f85910d9bb	\N	Connecticut	Connecticut	7	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
6f22eff1-d5d9-49c1-aec5-573b50ed9f58	\N	Delaware	Delaware	8	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
7c46df77-1d50-4cae-8a1a-78f988db1678	\N	Florida	Florida	9	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
a0ec1525-5434-4229-9638-d1bec95b4784	\N	Georgia	Georgia	10	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
c81a5e0f-f423-45cc-80d3-b325ed93b236	\N	Hawaii	Hawaii	11	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
d1c95ca3-efcf-4f4a-9b01-d16e23618b92	\N	Idaho	Idaho	12	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
7d9facb8-8330-4b52-8fa8-39a7994c5427	\N	Illinois	Illinois	13	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
4905ca0a-632f-4ed8-978e-1e581988b9ea	\N	Indiana	Indiana	14	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
6f4a5ed5-e3fd-4ad3-ab43-caaf2bf76668	\N	Iowa	Iowa	15	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
8e239a7a-6eba-4be3-b79d-c525746f53fc	\N	Kansas	Kansas	16	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
a15afd13-7222-4b8e-b0da-cab86183ce29	\N	Kentucky	Kentucky	17	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
25037750-eab5-4595-93b7-08cdb59c5640	\N	Louisiana	Louisiana	18	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
56b20aef-34a8-425f-ae98-d3c67dcdf59e	\N	Maine	Maine	19	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
dbf94d07-e85a-4caa-9409-3761d66d42e0	\N	Maryland	Maryland	20	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
e9563533-624e-45a8-8be5-27d9886ebc50	\N	Massachusetts	Massachusetts	21	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
74e6e2b3-f504-4bee-93c1-aabb87864e35	\N	Michigan	Michigan	22	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
1d4b8f07-b7b0-48f5-87cd-70fd54c73f97	\N	Minnesota	Minnesota	23	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
1d6bb8ed-565b-4471-944c-aac562d4c668	\N	Mississippi	Mississippi	24	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
783518be-7afb-499c-982a-cb28864362b0	\N	Missouri	Missouri	25	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
18af483d-99a3-4911-98e9-71c6ce11364c	\N	Montana	Montana	26	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
313f760d-399f-4e48-9a14-031ecc54c994	\N	Nebraska	Nebraska	27	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
7143bc14-d8f6-45df-ba7a-4be898e4b5f2	\N	Nevada	Nevada	28	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
660a004f-3c26-4ff1-890f-61cc03113a04	\N	New Hampshire	New Hampshire	29	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
aac2d531-db53-4222-b62c-c5a86e285a23	\N	New Jersey	New Jersey	30	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
b97831ce-a574-4a82-a96a-fbf7c47127bc	\N	New Mexico	New Mexico	31	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
0f35888f-00ae-4008-a6ac-93f7e25ab143	\N	New York	New York	32	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
e97be1a8-3476-4e06-8354-ae1cf871ee7b	\N	North Carolina	North Carolina	33	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
2a2f1efd-81d1-4a9d-b03a-0939a1e8624d	\N	North Dakota	North Dakota	34	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
f93a999b-de4d-4890-841c-d77a7f4ba734	\N	Ohio	Ohio	35	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
bebf5775-1819-4edf-8f0e-b07b391e1096	\N	Oklahoma	Oklahoma	36	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
4b872c18-f3c6-426a-ad0f-568c1ce87e8b	\N	Oregon	Oregon	37	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
8a6ced3d-9cab-4bf6-a28a-3a00ac4952b0	\N	Pennsylvania	Pennsylvania	38	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
4ac6f56b-2349-4b0f-a1c0-5112f61a5708	\N	Rhode Island	Rhode Island	39	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
da61a03a-ec4f-4481-b988-bd129df51f5a	\N	South Carolina	South Carolina	40	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
a92542df-1e12-4d62-9f1e-40439e5d6134	\N	South Dakota	South Dakota	41	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
394994a3-08cd-4084-893c-02c2e5f3660e	\N	Tennessee	Tennessee	42	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
cb6a71a1-cd51-4358-86d2-e7919dcee424	\N	Texas	Texas	43	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
c759f55a-7109-4ce9-b8e2-7529b4943932	\N	Utah	Utah	44	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
156c51ea-bf0c-49b6-963c-b82aa55dff37	\N	Vermont	Vermont	45	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
d5c97c40-d9dc-4c2a-940d-34841276ad1c	\N	Virginia	Virginia	46	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
91e6217c-0534-40e0-871d-3c399f1a0add	\N	Washington	Washington	47	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
839b6a40-3f4b-4434-bbb4-785f0a21430d	\N	West Virginia	West Virginia	48	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
42f22683-cb97-4f85-b75e-5cc7e341dcd8	\N	Wisconsin	Wisconsin	49	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
b06d2d37-8fad-4bc5-9d85-2c83f5271b18	\N	Wyoming	Wyoming	50	c3d974a8-32c7-4993-8fe8-e6d2c0404df8	2025-10-06 23:51:54.063-03	2025-10-06 23:51:54.063-03
5b6c030d-b7c3-4e44-884c-313a8f4ed899	\N	Male	Male	1	f58d7eb3-7e64-4124-aca3-ac34da2a71a6	2025-10-06 23:51:54.071-03	2025-10-06 23:51:54.071-03
fe75b4aa-b201-4d04-993b-4549632cae78	\N	Female	Female	2	f58d7eb3-7e64-4124-aca3-ac34da2a71a6	2025-10-06 23:51:54.071-03	2025-10-06 23:51:54.071-03
dd6e9c5d-70c9-4ff3-9910-9fc2e013db6d	\N	None of the above	None of the above	1	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
b0345dfc-6182-4778-8102-4b6c2f26e118	\N	Gallbladder disease or removal	Gallbladder disease or removal	2	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
95897d58-9d43-406d-b388-60c29b01648e	\N	Hypertension	Hypertension	3	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
5eda3f30-9ffe-47e9-b3ea-f6a6f26efe53	\N	High cholesterol or triglycerides	High cholesterol or triglycerides	4	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
d817b754-2f17-46fa-9375-5c728d800cb0	\N	Sleep apnea	Sleep apnea	5	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
735ebfd2-642d-4e3e-b364-3fc44fa67516	\N	Osteoarthritis	Osteoarthritis	6	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
05a5497f-dac4-42cc-b8dc-a11e064bad91	\N	Mobility issues due to weight	Mobility issues due to weight	7	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
5026f1c9-9ee5-49df-9c96-5d27d3db2da7	\N	GERD	GERD	8	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
7d605a59-33bc-42ba-a6f0-21305994df47	\N	PCOS with insulin resistance	PCOS with insulin resistance	9	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
170691d2-ad91-488a-8f08-b98e1d2e455b	\N	Liver disease or NAFLD	Liver disease or NAFLD	10	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
1019a024-2f00-4117-b906-649dd0be2efa	\N	Heart disease	Heart disease	11	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
183e1b2f-2088-43ea-9a2e-b03f0668336b	\N	Metabolic syndrome	Metabolic syndrome	12	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
1884d8d7-4f7d-4391-a3c6-ca0bbcba342a	\N	Chronic kidney disease (Stage 3+)	Chronic kidney disease (Stage 3+)	13	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
21bee07a-1a7c-4690-9f98-c1786a44e8b1	\N	SIADH	SIADH	14	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
149e9609-5fb0-4bdc-8fcf-1088edd45c17	\N	Thyroid conditions	Thyroid conditions	15	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
7a141dcf-d9ca-4040-9e79-d94925e46495	\N	Prediabetes	Prediabetes	16	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
bd8e6872-9c60-4f57-bf1d-ef53eb8855d6	\N	Type 2 diabetes	Type 2 diabetes	17	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
6f939017-5c88-4116-8a56-6f55791be9bb	\N	Gastroparesis	Gastroparesis	18	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
41b2eb05-cc48-4de7-b649-e9dd03533a90	\N	IBD (Crohn's or Colitis)	IBD (Crohn's or Colitis)	19	0e2ec041-ebfe-41ee-9339-ec2b6c6e507c	2025-10-06 23:51:54.082-03	2025-10-06 23:51:54.082-03
4cae56cd-ddc9-4d8b-92ea-ed76503854c0	\N	None of the above	None of the above	1	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
1817b599-633d-4eef-8d4d-ff3778365349	\N	Gastroparesis (Paralysis of your intestines)	Gastroparesis (Paralysis of your intestines)	2	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
02af097f-db15-476a-b806-9141434f4355	\N	Triglycerides over 600 at any point	Triglycerides over 600 at any point	3	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
b5af8251-401d-42a6-a4f7-ae48d0ba4714	\N	Pancreatic cancer	Pancreatic cancer	4	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
f0559005-4060-4a8a-8a8b-559fd701e7c4	\N	Pancreatitis	Pancreatitis	5	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
974c3025-ad00-41e0-a7c8-b87ecb9991f1	\N	Type 1 Diabetes	Type 1 Diabetes	6	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
01a8364a-beeb-4324-8a3a-86a92eb58c30	\N	Hypoglycemia (low blood sugar)	Hypoglycemia (low blood sugar)	7	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
e654c5b3-df64-47f8-aa5e-141913591758	\N	Insulin-dependent diabetes	Insulin-dependent diabetes	8	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
3ea17566-786a-4181-9c09-8aa2c1d86482	\N	Thyroid cancer	Thyroid cancer	9	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
a4c5d4b5-9e78-4f38-905a-59f57f042078	\N	Family history of thyroid cancer	Family history of thyroid cancer	10	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
35f792f6-1b5d-4e9e-8ddf-b483e24e672e	\N	Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome	Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome	11	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
2b7ecc5a-0a15-4403-9fad-d470d16cbf1d	\N	Anorexia or bulimia	Anorexia or bulimia	12	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
0c5bcd84-fca4-45fa-9ac5-e39a16038ce5	\N	Current symptomatic gallstones	Current symptomatic gallstones	13	00e72c06-91f6-4f98-80dc-b76afb5f04e6	2025-10-06 23:51:54.085-03	2025-10-06 23:51:54.085-03
1971dc22-e5f4-49f4-a215-3cb6181ff6ea	\N	None of the above	None of the above	1	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
855bcdf0-7b0b-44c9-9b6f-9a341ae7f5cb	\N	Ozempic (Semaglutide)	Ozempic (Semaglutide)	2	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
9444e18f-9a3c-4b24-8005-1fd761094123	\N	Wegovy (Semaglutide)	Wegovy (Semaglutide)	3	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
6821ef88-111d-4ccc-b47c-4e8f285362a9	\N	Zepbound (Tirzepatide)	Zepbound (Tirzepatide)	4	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
9404a8c1-a914-4c0a-8bdf-59bb9ffcd27d	\N	Mounjaro (Tirzepatide)	Mounjaro (Tirzepatide)	5	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
13f3a81e-434b-4055-98ec-094febf575e9	\N	Saxenda (Liraglutide)	Saxenda (Liraglutide)	6	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
68dc2240-c706-4031-9f85-14e4ae46c72f	\N	Trulicity (Dulaglutide)	Trulicity (Dulaglutide)	7	8b09602c-e82e-4fec-a265-a56a23c2f6fc	2025-10-06 23:51:54.089-03	2025-10-06 23:51:54.089-03
d0563b43-70f8-448c-8577-aba323c3bbd6	\N	No, I don't take any medications	No, I don't take any medications	1	7d5df539-d98e-441d-b246-672cf096fa7b	2025-10-06 23:51:54.091-03	2025-10-06 23:51:54.091-03
7474d439-8dc7-4327-b51f-b4abe26e532d	\N	Yes, I take medications	Yes, I take medications	2	7d5df539-d98e-441d-b246-672cf096fa7b	2025-10-06 23:51:54.091-03	2025-10-06 23:51:54.091-03
19a9328e-b036-4152-8c4d-79c2675cba46	\N	None of the above	None of the above	1	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
765ff1b8-e5bf-44b5-8612-a9837fe74121	\N	Insulin	Insulin	2	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
82c4ba9c-4e18-4e12-a8f7-9257fca96ee5	\N	Glimepiride (Amaryl)	Glimepiride (Amaryl)	3	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
cd45af08-acf4-4161-a4c7-16a9bbfa98f8	\N	Meglitinides (e.g., repaglinide, nateglinide)	Meglitinides (e.g., repaglinide, nateglinide)	4	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
595b5dcc-3aa8-4a78-8233-d88a4e8633ac	\N	Glipizide	Glipizide	5	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
9f2522a8-7643-4b7b-8893-e73a11b954ab	\N	Glyburide	Glyburide	6	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
01cf4684-3333-4724-8a5e-82fbbce55dad	\N	Sitagliptin	Sitagliptin	7	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
4b7baf0b-b343-422b-ae0a-18db480406d2	\N	Saxagliptin	Saxagliptin	8	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
27888654-3b7f-4dba-ab6b-ab529cd693e3	\N	Linagliptin	Linagliptin	9	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
7fce7a27-0c8f-4955-ab9a-942186015e6e	\N	Alogliptin	Alogliptin	10	1b26c9e0-adcc-4efc-a59a-7300fdefad79	2025-10-06 23:51:54.094-03	2025-10-06 23:51:54.094-03
b3392a6f-5681-4f9e-a5d5-5a52736a3837	\N	Semaglutide (Ozempic, Wegovy)	Semaglutide (Ozempic, Wegovy)	1	149f5f26-5c2b-429c-81b5-ce4a5f4927e8	2025-10-06 23:51:54.098-03	2025-10-06 23:51:54.098-03
179f7e9e-7670-492f-a1bb-6c2d6065e7e7	\N	Liraglutide (Saxenda, Victoza)	Liraglutide (Saxenda, Victoza)	2	149f5f26-5c2b-429c-81b5-ce4a5f4927e8	2025-10-06 23:51:54.098-03	2025-10-06 23:51:54.098-03
3047a9a0-4930-41cd-9163-22b7e3231ae1	\N	Tirzepatide (Mounjaro, Zepbound)	Tirzepatide (Mounjaro, Zepbound)	3	149f5f26-5c2b-429c-81b5-ce4a5f4927e8	2025-10-06 23:51:54.098-03	2025-10-06 23:51:54.098-03
e1bb7135-01fe-4482-9a28-2f42b50e390f	\N	Other weight loss medication	Other weight loss medication	4	149f5f26-5c2b-429c-81b5-ce4a5f4927e8	2025-10-06 23:51:54.098-03	2025-10-06 23:51:54.098-03
276945cd-551b-4097-b33b-f19a44795cf8	\N	No, I haven't taken weight loss medications	No, I haven't taken weight loss medications	1	b535ebbc-3df8-4801-83b7-d0b3e730f16a	2025-10-06 23:51:54.099-03	2025-10-06 23:51:54.099-03
394df89c-6829-40ec-9f28-4ca72954420a	\N	Yes, I have taken weight loss medications before.	Yes, I have taken weight loss medications before.	2	b535ebbc-3df8-4801-83b7-d0b3e730f16a	2025-10-06 23:51:54.099-03	2025-10-06 23:51:54.099-03
18e2a4f5-f086-402f-aa8b-992bec6590d9	\N	Yes	Yes	1	75f6b467-05a7-48e0-8bd4-9e7b991e1084	2025-10-06 23:51:54.114-03	2025-10-06 23:51:54.114-03
ab7b5a76-9fd8-4d7b-b8e7-d5c2ef023a54	\N	No	No	2	75f6b467-05a7-48e0-8bd4-9e7b991e1084	2025-10-06 23:51:54.114-03	2025-10-06 23:51:54.114-03
01649efd-8fb7-4475-baf4-06fd0b220c36	\N	Yes	Yes	1	40080132-5685-4d6a-9fce-dda35a198d32	2025-10-06 23:51:54.115-03	2025-10-06 23:51:54.115-03
43d0eebe-d276-4cb1-bfc7-de17c7542e45	\N	No	No	2	40080132-5685-4d6a-9fce-dda35a198d32	2025-10-06 23:51:54.115-03	2025-10-06 23:51:54.115-03
38b2e5b5-7384-4b48-8378-fefeaedfbc9f	\N	Yes	Yes	1	d71c5d35-f5a2-4575-a426-ae6a51f80662	2025-10-06 23:51:54.116-03	2025-10-06 23:51:54.116-03
dbe5de12-6054-4c95-9af6-aaa512f5b02c	\N	No	No	2	d71c5d35-f5a2-4575-a426-ae6a51f80662	2025-10-06 23:51:54.116-03	2025-10-06 23:51:54.116-03
13e86d6a-12ac-4b12-a6d3-a44bf14ee7e2	\N	Yes	Yes	1	6aa81f33-1561-4e62-9ff3-2ef8764ef922	2025-10-06 23:51:54.117-03	2025-10-06 23:51:54.117-03
7e94b109-6013-4894-b7ed-b27cb566033f	\N	No	No	2	6aa81f33-1561-4e62-9ff3-2ef8764ef922	2025-10-06 23:51:54.117-03	2025-10-06 23:51:54.117-03
63b3b9b6-dce5-42bd-918a-e83cc3f5f315	2025-10-08 22:33:17.417-03	Option 1	option_1	1	c371e6a1-c461-44ab-981b-bcdadfa9ffe0	2025-10-08 22:33:02.997-03	2025-10-08 22:33:02.997-03
77044b90-9a2d-423a-b9e5-6ed43f89740b	2025-10-08 22:33:17.417-03	Option 2	option_2	2	c371e6a1-c461-44ab-981b-bcdadfa9ffe0	2025-10-08 22:33:02.997-03	2025-10-08 22:33:02.997-03
810ab06f-549e-4d23-b86a-79210beb2e55	\N	Yes	Yes	1	9a58d2cb-7adb-41cc-a8ac-8e98a8c7c416	2025-10-08 22:33:40.635-03	2025-10-08 22:33:40.635-03
8ce17215-97a3-482b-b7ef-5c43a9db23ed	\N	No	No	2	9a58d2cb-7adb-41cc-a8ac-8e98a8c7c416	2025-10-08 22:33:40.635-03	2025-10-08 22:33:40.635-03
dde5c891-4cd6-4d1a-93bd-e3df66b188f0	2025-10-08 23:19:58.368-03	Option 1	option_1	1	4bde4b19-f04c-43e5-87e2-36e692710a7e	2025-10-08 23:19:37.106-03	2025-10-08 23:19:37.106-03
cf765203-7ca3-4abc-9a7d-0d24a13c0478	2025-10-08 23:19:58.368-03	Option 2	option_2	2	4bde4b19-f04c-43e5-87e2-36e692710a7e	2025-10-08 23:19:37.106-03	2025-10-08 23:19:37.106-03
432615a0-62ea-4b59-817f-ce523a0e7a49	2025-10-08 23:20:41.925-03	Option 1	option_1	1	1b695713-dfbd-4902-bc28-808f98fddab0	2025-10-08 23:20:26.542-03	2025-10-08 23:20:26.542-03
6d4aba70-eaa4-4096-8f76-83ebe8d7eb27	2025-10-08 23:20:41.925-03	Option 2	option_2	2	1b695713-dfbd-4902-bc28-808f98fddab0	2025-10-08 23:20:26.542-03	2025-10-08 23:20:26.542-03
8456ae48-f9fc-430d-84b5-fff38d5b0c52	2025-10-08 23:25:51.101-03	Option 1	option_1	1	1f0d577f-2987-4485-8233-769125306d65	2025-10-08 23:21:04.829-03	2025-10-08 23:21:04.829-03
ff19282e-d4e8-4c49-b6dd-f5256aecca31	2025-10-08 23:25:51.101-03	Option 2	option_2	2	1f0d577f-2987-4485-8233-769125306d65	2025-10-08 23:21:04.829-03	2025-10-08 23:21:04.829-03
348a669b-2773-4edc-98fb-7f72a8f4d9f9	\N	Option 1	Option 1	1	c9c4b3ba-1390-4f8e-8a13-875fd3d40fe4	2025-10-08 23:26:54.006-03	2025-10-08 23:26:54.006-03
63a5373a-2910-46ac-83c9-f4082ec7ec56	\N	Option 2	Option 2	2	c9c4b3ba-1390-4f8e-8a13-875fd3d40fe4	2025-10-08 23:26:54.006-03	2025-10-08 23:26:54.006-03
\.


--
-- TOC entry 7340 (class 0 OID 50933)
-- Dependencies: 230
-- Data for Name: Questionnaire; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Questionnaire" (id, "deletedAt", title, description, "treatmentId", "createdAt", "updatedAt", "checkoutStepPosition", "userId", "isTemplate", color, "productId", "personalizationQuestionsSetup", "createAccountQuestionsSetup", "doctorQuestionsSetup", "formTemplateType", category) FROM stdin;
aa08a2d8-b298-434a-ad06-3ec7485fe50c	\N	NAD+ Intake Questionnaire	Complete intake questionnaire for NAD+ treatment	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-12 22:03:17.616-03	2025-09-12 22:03:17.616-03	0	\N	f	\N	\N	f	f	f	\N	\N
c974ee9f-3e61-42b9-a0d2-08d1ca6e43f4	\N	Weight Loss Checkout	Select your weight loss plan and complete your order	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 00:23:32.268-03	2025-09-16 00:23:32.268-03	0	\N	f	\N	\N	f	f	f	\N	\N
e3d3e799-a278-4bea-9dcb-3bb9744d765f	\N	Weight Loss Assessment	Complete your personalized weight loss evaluation	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-10-06 23:51:54.039-03	2025-10-06 23:51:54.039-03	19	1f8acc57-f137-4b51-ad44-cad317ba43cf	f		\N	f	f	f	\N	\N
0901cc29-3208-45b5-8253-ce4e2f0d8d4d	\N	Weight Loss Personalization Questions	Category-specific personalization questions for Weight Loss products	\N	2025-10-08 17:10:14.667-03	2025-10-08 17:10:14.667-03	-1	\N	t	\N	\N	f	f	f	\N	\N
98be4649-5763-4396-aac2-ecdc09b510e4	\N	Acne Astringent (Salicylic Acid/ Niacinamide) Form	Questionnaire for Acne Astringent (Salicylic Acid/ Niacinamide)	\N	2025-10-08 23:26:57.597-03	2025-10-08 23:26:57.597-03	-1	\N	t	\N	ecb41c2d-1873-4f91-91d1-596e4fe8bae6	f	f	f	\N	\N
240ab198-2fa8-483b-9a7a-5b823657f04c	\N	Acne Gel (Tretinoin/Clindamyacin/Metronidazole/Azelaic Acid) Form	Questionnaire for Acne Gel (Tretinoin/Clindamyacin/Metronidazole/Azelaic Acid)	\N	2025-10-09 00:38:56.24-03	2025-10-09 00:38:56.24-03	-1	\N	t	\N	32a08f29-887b-47b1-a56e-dee2def30c8a	f	f	f	\N	\N
11797ef7-5b80-4f68-b845-7d531f90e7d3	\N	Ozempic (with Needle Tips) Form	Questionnaire for Ozempic (with Needle Tips)	\N	2025-10-08 23:19:08.975-03	2025-10-08 23:19:08.975-03	-1	\N	t	\N	550e8400-e29b-41d4-a716-446655440101	f	f	f	\N	\N
f3c59c3c-2648-425e-a9c5-f9874963c9c7	\N	Ozempic (with Needle Tips) Form	Questionnaire for Ozempic (with Needle Tips)	\N	2025-10-09 01:25:16.904-03	2025-10-09 01:25:16.904-03	-1	\N	t	\N	48ac0e38-ebc2-476e-a1b8-8e42dc52f51d	f	f	f	\N	\N
6cda4f1b-0bd8-4e5c-9a42-30848a802472	\N	Ozempic (with Needle Tips) Form	Questionnaire for Ozempic (with Needle Tips)	\N	2025-10-09 01:25:23.564-03	2025-10-09 01:25:23.564-03	-1	\N	t	\N	5800dc14-aba1-4079-bfb9-b22323cbe442	f	f	f	\N	\N
6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	\N	Weight Loss Assessment	Complete your personalized weight loss evaluation	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-17 23:18:06.611-03	2025-09-17 23:18:06.611-03	19	\N	t		\N	f	f	f	master_template	\N
\.


--
-- TOC entry 7341 (class 0 OID 50940)
-- Dependencies: 231
-- Data for Name: QuestionnaireStep; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."QuestionnaireStep" (id, "deletedAt", title, description, "stepOrder", "questionnaireId", "createdAt", "updatedAt", category) FROM stdin;
122e2488-83ae-4cf7-98cf-27f15e48cf2b	\N	Welcome	We'll ask a few quick questions about your health, lifestyle, and goals. This helps your provider design the safest and most effective NAD+ plan for you.	1	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
16e9bb0d-91d1-4111-814b-6895a035d6f8	\N	Basics	Basic personal information	2	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	\N	Body Metrics	Height and weight information	3	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
ee5c1f70-eae6-4991-888b-6c0a99ba003e	\N	Medical Background	Medical history and current conditions	4	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
34643bfd-1617-487c-958f-25ff3607bc62	\N	Lifestyle & Habits	Lifestyle and daily habits	5	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
615e5d08-0e76-4efd-b7b6-6e879ac30358	\N	NAD+ Goals & Motivation	Your goals and motivations for NAD+ treatment	6	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
8e76b4dc-40fe-430c-911b-5c79541bd48b	\N	NAD+ Experience	Previous experience with NAD+	7	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
3203bc79-aa85-447f-982a-902416bbbce8	\N	Treatment Preferences	Your treatment preferences and expectations	8	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
ecabf119-f28e-470e-9042-f137a695df6b	\N	Final Step	Thanks for completing your NAD+ intake! Your information will be reviewed by your provider to create your personalized NAD+ plan.	9	aa08a2d8-b298-434a-ad06-3ec7485fe50c	2025-09-12 22:03:17.623-03	2025-09-12 22:03:17.623-03	normal
494573f0-07e4-41cd-96d6-216a8f15aadc	\N	Your Weight Loss Goals	What is your main goal with weight loss medication?	1	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	normal
8a345b19-211e-49c5-9d81-b7b868f9c537	\N	Weight Loss History	Have you tried losing weight before?	2	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	normal
f7f9d3d9-ea39-4103-9b10-644a41f84a1e	\N	Challenges You Face	What is the main difficulty you face when trying to lose weight?	3	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	normal
9ca2b81c-06ab-4753-a588-3c98e1c460f8	\N	Treatment Information	83% of HeyFeels patients report that weight loss medication helps them achieve their goals more effectively.	4	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	normal
fce69cde-4d4c-4465-a251-e929522ba024	\N	Location Verification	What state do you live in?	5	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	user_profile
54f9762f-a900-4325-a04a-ab5afcec282d	\N	Personal Information	What's your gender at birth?	6	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	user_profile
ecaa2116-ce93-4bb0-b869-c84f740bdffc	\N	Age Verification	What's your date of birth?	7	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	user_profile
40eac62a-6faa-4aa0-87cf-5662f8ff6b49	\N	Create Your Account	We'll use this information to set up your personalized care plan	8	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	user_profile
3a3e0224-c757-4a81-96f8-7c4c25a88853	\N	Success Stories	Real customers who have achieved amazing results with HeyFeels	10	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
30c35e91-cdb7-488e-bee3-f25d753edd94	\N	Body Measurements	What is your current height and weight?	11	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
56bba504-0209-434e-906a-a0f48288568f	\N	Welcome!	We're excited to partner with you on your personalized weight loss journey.	9	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	user_profile
4479a22d-7b23-4937-bae3-2f0eff0dbdba	\N	Target Weight	What is your goal weight?	12	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
8e41a76d-cb19-4efd-af93-6b1a55242cc3	\N	Medical History - General	Do you have any of these medical conditions?	13	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
d12604a8-5711-4cf4-9946-617c4f12a97c	\N	Medical History - Specific	Do you have any of these medical conditions?	14	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
81c71333-a59c-4c63-b6cd-7159c636851d	\N	Allergies	Are you allergic to any of the following?	15	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
54c7c986-ca72-481a-b6f4-c0bc68b595bc	\N	Current Medications	Are you currently taking any medications?	16	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
29165ffd-1067-45a3-b5c9-28209e9865d2	\N	Diabetes Medications	Are you currently taking any of the following medications?	17	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
0cc47ef9-3c65-4165-8b2f-1557787a7f6f	\N	Weight Loss Medication History	Have you taken weight loss medications before?	18	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
1d168c52-b65e-4da2-88fe-a57a602d8337	\N	Recommended Treatment	Based on your assessment, our providers recommend this treatment	19	6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	2025-09-17 23:18:06.616-03	2025-09-17 23:18:06.616-03	doctor
2448f647-01ec-4f01-941f-e4f3c8935750	\N	Your Weight Loss Goals	What is your main goal with weight loss medication?	1	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.049-03	2025-10-06 23:51:54.049-03	normal
846002ca-620a-4578-b621-6af55adef446	\N	Weight Loss History	Have you tried losing weight before?	2	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.054-03	2025-10-06 23:51:54.054-03	normal
bb014898-4c5f-4bcc-b273-d6cf6ef58b1e	\N	Challenges You Face	What is the main difficulty you face when trying to lose weight?	3	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.057-03	2025-10-06 23:51:54.057-03	normal
69c174cc-aa7c-472b-86de-145e105ba91c	\N	Treatment Information	83% of HeyFeels patients report that weight loss medication helps them achieve their goals more effectively.	4	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.06-03	2025-10-06 23:51:54.06-03	normal
52bdadb2-f95a-4d00-b480-2d751ef5fd10	\N	Location Verification	What state do you live in?	5	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.061-03	2025-10-06 23:51:54.061-03	user_profile
7df8d329-3843-4f95-92ac-f5e76255567c	\N	Personal Information	What's your gender at birth?	6	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.069-03	2025-10-06 23:51:54.069-03	user_profile
3967f640-aac1-43e8-976f-2db28cc06256	\N	Age Verification	What's your date of birth?	7	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.071-03	2025-10-06 23:51:54.071-03	user_profile
2b80ed58-5cc1-404d-b04a-1a8e163a83e7	\N	Create Your Account	We'll use this information to set up your personalized care plan	8	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.072-03	2025-10-06 23:51:54.072-03	user_profile
c0cbae50-515e-4678-b7fb-82d7d72bd9bd	\N	Success Stories	Real customers who have achieved amazing results with HeyFeels	10	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.076-03	2025-10-06 23:51:54.076-03	doctor
ce55be0b-0722-458a-95de-029869b1892b	\N	Body Measurements	What is your current height and weight?	11	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.077-03	2025-10-06 23:51:54.077-03	doctor
9bd23482-4bca-4377-8068-af0d24e877f8	\N	Welcome!	We're excited to partner with you on your personalized weight loss journey.	9	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.079-03	2025-10-06 23:51:54.079-03	user_profile
5984f0b8-b301-4165-bbf6-a307b29d7a59	\N	Target Weight	What is your goal weight?	12	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.08-03	2025-10-06 23:51:54.08-03	doctor
da434768-28bd-4ecd-bbbc-9c31ad6b2542	\N	Medical History - General	Do you have any of these medical conditions?	13	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.081-03	2025-10-06 23:51:54.081-03	doctor
b443a272-5fe5-4e5c-97f3-0d682a9dd1c9	\N	Medical History - Specific	Do you have any of these medical conditions?	14	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.084-03	2025-10-06 23:51:54.084-03	doctor
7909f5eb-bb86-41e0-bd10-365e49cf8ff2	\N	Allergies	Are you allergic to any of the following?	15	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.087-03	2025-10-06 23:51:54.087-03	doctor
85d4d6bd-fac4-4df9-b977-ac3f55ed9f6e	\N	Current Medications	Are you currently taking any medications?	16	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.09-03	2025-10-06 23:51:54.09-03	doctor
eab2e442-34a8-4cc7-a9e9-3f7e8a433561	\N	Diabetes Medications	Are you currently taking any of the following medications?	17	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.092-03	2025-10-06 23:51:54.092-03	doctor
2f484d0a-0f72-40f1-9273-038f33d492ca	\N	Weight Loss Medication History	Have you taken weight loss medications before?	18	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.097-03	2025-10-06 23:51:54.097-03	doctor
d68b7191-8237-4a6a-acb8-9b74043f4ad3	\N	Recommended Treatment	Based on your assessment, our providers recommend this treatment	19	e3d3e799-a278-4bea-9dcb-3bb9744d765f	2025-10-06 23:51:54.118-03	2025-10-06 23:51:54.118-03	doctor
7d18af7f-6d56-4ec4-99df-215ce8b00dd1	\N	Have you tried weight loss before ?	Let us know when.	1	0901cc29-3208-45b5-8253-ce4e2f0d8d4d	2025-10-08 17:41:09.829-03	2025-10-08 17:42:10.046-03	normal
1479b82d-d14b-496e-9200-9a4882533034	2025-10-08 22:33:17.42-03	New Step		2	0901cc29-3208-45b5-8253-ce4e2f0d8d4d	2025-10-08 22:33:02.973-03	2025-10-08 22:33:02.973-03	normal
15b632be-ff16-4cc4-99ec-e0e59caa6ac6	\N	This is a information step	I just want to give you some information here	3	0901cc29-3208-45b5-8253-ce4e2f0d8d4d	2025-10-08 22:33:05.011-03	2025-10-08 22:33:40.619-03	normal
c0931985-802b-4179-9cde-d6118bc07539	2025-10-08 23:19:53.381-03	New Step		1	11797ef7-5b80-4f68-b845-7d531f90e7d3	2025-10-08 23:19:16.368-03	2025-10-08 23:19:16.368-03	normal
0b9e59f5-a37d-493f-a90e-4510b3564a94	2025-10-08 23:19:58.375-03	New Step		2	11797ef7-5b80-4f68-b845-7d531f90e7d3	2025-10-08 23:19:37.079-03	2025-10-08 23:19:37.079-03	normal
c8c752ff-91de-4372-94c9-515ed7e760ad	2025-10-08 23:20:41.928-03	New Step		2	11797ef7-5b80-4f68-b845-7d531f90e7d3	2025-10-08 23:20:26.52-03	2025-10-08 23:20:26.52-03	normal
105d853c-7637-4d8f-ac6c-acac7a8a233b	2025-10-08 23:25:51.108-03	New Step		2	11797ef7-5b80-4f68-b845-7d531f90e7d3	2025-10-08 23:21:04.807-03	2025-10-08 23:21:04.807-03	normal
c4af6565-6136-4396-9cac-02183cc57bfa	\N	Some Info	Some Info Description	1	11797ef7-5b80-4f68-b845-7d531f90e7d3	2025-10-08 23:20:00.07-03	2025-10-08 23:26:32.032-03	normal
c7f1bf06-741d-4d75-a3d9-575c4ae72268	\N	Some Question	Some Question Description	2	11797ef7-5b80-4f68-b845-7d531f90e7d3	2025-10-08 23:26:32.06-03	2025-10-08 23:26:53.982-03	normal
\.


--
-- TOC entry 7342 (class 0 OID 50946)
-- Dependencies: 232
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
-- TOC entry 7343 (class 0 OID 50949)
-- Dependencies: 233
-- Data for Name: ShippingAddress; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."ShippingAddress" (id, "deletedAt", address, apartment, city, state, "zipCode", country, "createdAt", "updatedAt", "userId", "isDefault") FROM stdin;
28ffb6ae-2b52-43d6-90ad-8b8244831350	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-20 02:41:16.748-03	2025-09-20 02:41:16.748-03	89b0ef70-7516-4fad-ac4a-37ac74815031	f
dc1053d7-0ca3-4c6d-8112-744694b84998	\N	66 Hansen Way	Apartment 4	Palo Alto	AZ	94304	us	2025-09-20 02:47:54.352-03	2025-09-20 02:47:54.352-03	2551f7cc-8c84-48da-bec3-fde2b39bc3cb	f
286c59e3-6e64-4acf-bdac-e71e045d54d5	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-22 22:47:19.589-03	2025-09-22 22:47:19.589-03	0007334a-e487-43a7-971b-5c4c8d2950fa	f
7a859b38-9664-41b1-860e-fc34e49a87b2	\N	Av. Bernardo Vieira de Melo 4250	Apt 801	Jaboatao dos Guararapes	CA	54420-010	us	2025-09-22 23:05:29.582-03	2025-09-22 23:05:29.582-03	8f59fb0a-ca8b-4e82-9104-eeea4e727f39	f
e817cd77-9886-4247-9b61-5336c5f7ff3d	\N	Hansen Way 64	801	Palo Alto	CA	94304	us	2025-09-22 23:10:55.515-03	2025-09-22 23:10:55.515-03	b89d92d0-dc03-487b-a246-a341ec5d1f37	f
b34d7a27-b518-4bcc-930d-7a6ebfbfe089	\N	Hansen Way 64	Apartment 4	Palo Alto	AL	94304	us	2025-09-22 23:14:19.727-03	2025-09-22 23:14:19.727-03	b89d92d0-dc03-487b-a246-a341ec5d1f37	f
e0805c5d-32e4-4f14-a635-918490036ead	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-22 23:34:08.321-03	2025-09-22 23:34:08.321-03	6b028641-7fb2-47bb-9fca-fedb3ea2ecd7	f
a2539844-289c-44bd-bf2a-76f8e42ce9e5	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-24 15:54:30.778-03	2025-09-24 15:54:30.778-03	3b2cadbc-829e-4efd-b0f4-0a4e97c73ebb	f
30cbc304-7ce4-42b4-8f8b-286cf8cba3b4	\N	66 Hansen Way	Apartment 4	Palo Alto	AK	94304	us	2025-09-24 17:37:16.325-03	2025-09-24 17:37:16.325-03	95214474-1920-4524-a513-2325edeb73dc	f
688fc6e2-8020-4e59-9591-288f84a33872	\N	66 Hansen Way	Apartment 4	Palo Alto	CA	94304	us	2025-09-25 22:44:40.057-03	2025-09-25 22:44:40.057-03	ab53f6ca-471c-42cb-b421-953142ac08ef	f
7002e70f-d733-493d-a822-68111a245ffa	\N	66 Hansen Way	Apartment 4	Palo Alto	CO	94304	us	2025-09-25 23:17:18.639-03	2025-09-25 23:17:18.639-03	4edbbd82-9bb1-401d-bd9b-ab4565e3eeee	f
\.


--
-- TOC entry 7344 (class 0 OID 50956)
-- Dependencies: 234
-- Data for Name: ShippingOrder; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."ShippingOrder" (id, "deletedAt", "orderId", status, "pharmacyOrderId", "deliveredAt", "createdAt", "updatedAt", "shippingAddressId") FROM stdin;
\.


--
-- TOC entry 7345 (class 0 OID 50960)
-- Dependencies: 235
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Subscription" (id, "deletedAt", "clinicId", "orderId", status, "cancelledAt", "paymentDue", "stripeSubscriptionId", "paidAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 7346 (class 0 OID 50964)
-- Dependencies: 236
-- Data for Name: TenantProduct; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."TenantProduct" (id, "deletedAt", "clinicId", "productId", "questionnaireId", active, "createdAt", "updatedAt") FROM stdin;
5034d159-7857-4707-bd66-e37026dcaf31	\N	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	550e8400-e29b-41d4-a716-446655440101	11797ef7-5b80-4f68-b845-7d531f90e7d3	t	2025-10-09 23:21:35.751-03	2025-10-09 23:21:35.751-03
\.


--
-- TOC entry 7347 (class 0 OID 50968)
-- Dependencies: 237
-- Data for Name: TenantProductForms; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."TenantProductForms" (id, "deletedAt", "tenantId", "treatmentId", "layoutTemplate", "themeId", "lockedUntil", "publishedUrl", "lastPublishedAt", "createdAt", "updatedAt", "productId", "questionnaireId", "clinicId") FROM stdin;
06dacd15-b252-4a96-9ac7-bac77e08b756	\N	1f8acc57-f137-4b51-ad44-cad317ba43cf	\N	layout_a	\N	\N	\N	\N	2025-10-09 23:21:35.721-03	2025-10-09 23:21:35.721-03	550e8400-e29b-41d4-a716-446655440101	11797ef7-5b80-4f68-b845-7d531f90e7d3	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7
\.


--
-- TOC entry 7348 (class 0 OID 50974)
-- Dependencies: 238
-- Data for Name: Treatment; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."Treatment" (id, "deletedAt", name, "userId", "createdAt", "updatedAt", "clinicId", "treatmentLogo", "productsPrice", active, "stripeProductId", "mdCaseId", slug, "pharmacyProvider", category) FROM stdin;
ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	Weight Loss	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-15 23:47:36.817-03	2025-09-25 00:11:23.863-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757997453304-weight-loss.jpg	4950	f	\N	\N	weight-loss	absoluterx	\N
724eb0c4-54a3-447c-8814-de4c1060e77a	\N	Anti Aging NAD+	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 16:36:56.119-03	2025-09-25 00:11:23.862-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757708989911-flower.jpg	1478.4	f	\N	\N	anti-aging-nad+	absoluterx	\N
59881783-37d8-4c29-9636-6c60ee950069	\N	NAD	36546a22-fe6b-40ee-8da8-1aaa4014da4a	2025-09-29 17:00:14.835-03	2025-09-29 17:00:18.574-03	9feac14b-0aa1-48d5-bb32-14ba1f36d9bd	https://fusehealthbucket.s3.us-east-2.amazonaws.com/product-images/1759176017120-flower.jpg	0	f	prod_T95PHrTYe2nU0U	\N	nad	absoluterx	\N
44085547-afc4-4722-adf1-6722b4d4e0e9	\N	Energy Enhancement	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 16:36:56.119-03	2025-09-25 00:30:11.152-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758771009851-desert.jpg	0	f	\N	\N	energy-enhancement	absoluterx	\N
1e9d248d-5ff8-47b8-86a8-65200aa04b39	\N	Immune Support	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 16:36:56.119-03	2025-09-25 00:31:25.137-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758771083826-dolphin.jpg	0	f	\N	\N	immune-support	absoluterx	\N
0bc5e6fa-360f-412c-8d11-34910ee05fe0	\N	Anti Aging Glutathione	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 16:36:56.119-03	2025-09-12 17:35:24.404-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757709322973-bird.jpg	0	f	\N	\N	anti-aging-glutathione	absoluterx	\N
b689451f-db88-4c98-900e-df3dbcfebe2a	\N	Weight Loss 2	31ca4227-94d1-43bf-990a-43a14b938609	2025-09-17 23:15:08.309-03	2025-09-25 00:11:23.863-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758169025047-pexels-pixabay-53404.jpg	1042.8	f	prod_T5LaIujOqlryWl	\N	weight-loss-2	absoluterx	\N
\.


--
-- TOC entry 7349 (class 0 OID 50982)
-- Dependencies: 239
-- Data for Name: TreatmentPlan; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."TreatmentPlan" (id, "deletedAt", name, description, "billingInterval", "stripePriceId", price, active, popular, "sortOrder", "treatmentId", "createdAt", "updatedAt") FROM stdin;
00e000db-2f7b-405f-85a1-d72148dda001	\N	Biannual Plan	Billed every six months\n	biannual	price_1S9IbLELzhgYQXTRdQ0usXlR	249	t	f	3	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-19 23:13:06.359469-03	2025-09-19 23:13:06.359469-03
d975cc52-4628-4981-bcde-de741823fce8	\N	Quarterly Plan	Billed every 3 months	quarterly	price_1S9IauELzhgYQXTR8omAvXR9	269	t	f	2	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-19 23:13:06.359469-03	2025-09-19 23:13:06.359469-03
96158ea4-d760-47f0-9b45-f119ffe7d23f	\N	Monthly Plan	Billed monthly	monthly	price_1S9IaGELzhgYQXTR0oOellfG	199	t	t	1	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-19 23:13:06.359469-03	2025-09-19 23:13:06.359469-03
\.


--
-- TOC entry 7350 (class 0 OID 50990)
-- Dependencies: 240
-- Data for Name: TreatmentProducts; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."TreatmentProducts" (id, "deletedAt", dosage, "productId", "treatmentId", "createdAt", "updatedAt") FROM stdin;
660e8400-e29b-41d4-a716-446655440001	\N	500 mg per infusion	550e8400-e29b-41d4-a716-446655440001	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-12 22:57:34.863-03	2025-09-12 22:57:34.863-03
660e8400-e29b-41d4-a716-446655440002	\N	300 mg daily	550e8400-e29b-41d4-a716-446655440002	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-12 22:57:34.863-03	2025-09-12 22:57:34.863-03
660e8400-e29b-41d4-a716-446655440003	\N	750 mg NAD+ + B-complex per infusion	550e8400-e29b-41d4-a716-446655440003	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-12 22:57:34.863-03	2025-09-12 22:57:34.863-03
660e8400-e29b-41d4-a716-446655440004	\N	500 mg NAD+ + 2000 mg Glutathione per infusion	550e8400-e29b-41d4-a716-446655440004	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-12 22:57:34.863-03	2025-09-12 22:57:34.863-03
660e8400-e29b-41d4-a716-446655440005	\N	50 mg per spray, 2 sprays daily	550e8400-e29b-41d4-a716-446655440005	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-12 22:57:34.863-03	2025-09-12 22:57:34.863-03
660e8400-e29b-41d4-a716-446655440101	\N	0.25–2 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440101	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-15 23:48:03.079-03	2025-09-15 23:48:03.079-03
660e8400-e29b-41d4-a716-446655440102	\N	2.4 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440102	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-15 23:48:03.079-03	2025-09-15 23:48:03.079-03
660e8400-e29b-41d4-a716-446655440103	\N	2.5–15 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440103	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-15 23:48:03.079-03	2025-09-15 23:48:03.079-03
660e8400-e29b-41d4-a716-446655440104	\N	3 mg subcutaneous injection daily	550e8400-e29b-41d4-a716-446655440104	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-15 23:48:03.079-03	2025-09-15 23:48:03.079-03
660e8400-e29b-41d4-a716-446655440105	\N	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	550e8400-e29b-41d4-a716-446655440105	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-15 23:48:03.079-03	2025-09-15 23:48:03.079-03
660e8400-e29b-41d4-a716-446655440201	\N	0.25–2 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440201	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-17 23:36:49.931-03	2025-09-17 23:36:49.931-03
660e8400-e29b-41d4-a716-446655440202	\N	2.5–15 mg subcutaneous injection weekly	550e8400-e29b-41d4-a716-446655440202	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-17 23:36:49.931-03	2025-09-17 23:36:49.931-03
660e8400-e29b-41d4-a716-446655440203	\N	3 mg subcutaneous injection daily	550e8400-e29b-41d4-a716-446655440203	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-17 23:36:49.931-03	2025-09-17 23:36:49.931-03
\.


--
-- TOC entry 7351 (class 0 OID 50993)
-- Dependencies: 241
-- Data for Name: UserPatient; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public."UserPatient" ("userId", "pharmacyProvider", "pharmacyPatientId", metadata, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- TOC entry 7352 (class 0 OID 50998)
-- Dependencies: 242
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 7353 (class 0 OID 51003)
-- Dependencies: 243
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fusehealth_user
--

COPY public.users (id, "deletedAt", "firstName", "lastName", email, "passwordHash", dob, "phoneNumber", address, city, state, "zipCode", role, "lastLoginAt", "consentGivenAt", "emergencyContact", "createdAt", "updatedAt", "clinicId", "pharmacyPatientId", gender, allergies, diseases, medications, "stripeCustomerId", activated, "activationToken", "activationTokenExpiresAt", "mdPatientId", "newMessages", "businessType", website, "selectedPlanCategory", "selectedPlanType", "selectedPlanName", "selectedPlanPrice", "selectedDownpaymentType", "selectedDownpaymentName", "selectedDownpaymentPrice", "planSelectionTimestamp") FROM stdin;
f67562fc-11b9-4974-976a-61efe592d291	\N	Kale	Smith	iateyourkalechip@gmail.com	$2b$12$rlQlc////tVhfa6NrPTZX.yoZyu5vOVFNeUwKqbrb3L6pz4oWoQZC	2003-09-21	7062371480	\N	\N	\N	\N	patient	2025-09-22 00:40:35.481-03	2025-09-15 20:08:36.357-03	\N	2025-09-15 20:08:36.359-03	2025-09-22 00:40:35.481-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0007334a-e487-43a7-971b-5c4c8d2950fa	\N	John	Cena11	john.cena11@gmail.com	$2b$12$zko0KfApN7Y1C6zpKiuV0uJU8ZZNQVtT6EoSlksROV5Ly9wKxwhZ.	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-22 22:47:17.455-03	\N	2025-09-22 22:47:17.456-03	2025-09-22 22:47:19.406-03	\N	\N	\N	\N	\N	\N	cus_T6YQo4ZAUNW7MY	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8f59fb0a-ca8b-4e82-9104-eeea4e727f39	\N	John	Cena12	john.cena12@gmail.com	$2b$12$t.a0LIwOBnJarmRsnSN6CeRV2S8YX8UojB3/E/wryFWeW8T68fa4a	\N	34135135135	\N	\N	\N	\N	patient	\N	2025-09-22 23:05:27.45-03	\N	2025-09-22 23:05:27.451-03	2025-09-22 23:05:29.385-03	\N	\N	\N	\N	\N	\N	cus_T6YjqcBuAqVGg5	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b89d92d0-dc03-487b-a246-a341ec5d1f37	\N	John	Cena13	john.cena13@gmail.com	$2b$12$390DnW4PXkz0kvke09TEA.ie8o7vGVIaGdYqwheX8ZzBr80AiRUUa	\N	31413513513	\N	\N	\N	\N	patient	\N	2025-09-22 23:10:53.523-03	\N	2025-09-22 23:10:53.524-03	2025-09-22 23:10:55.331-03	\N	\N	\N	\N	\N	\N	cus_T6YoiuFwLv0T1p	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6b028641-7fb2-47bb-9fca-fedb3ea2ecd7	\N	John	Cena14	john.cena14@gmail.com	$2b$12$77BO4ybd3OKkpOM9sGGESOcQw91GjvzndnoytCycpxoS1GFbtCgTu	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-22 23:34:07.969-03	\N	2025-09-22 23:34:07.97-03	2025-09-22 23:34:08.317-03	\N	\N	\N	\N	\N	\N	cus_T6ZBZfsFeeCmrX	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4b4274d0-11df-4c69-8e94-915ab68a45d2	\N	Test	User	test@example.com	$2b$12$d7XWj1ZA7ns52sLMQ.aZX.GyKkJPh/NZX7uSTU3mmzBLngk1LEOBG	\N	\N	\N	\N	\N	\N	patient	\N	2025-09-23 17:04:55.577-03	\N	2025-09-23 17:04:55.578-03	2025-09-23 17:04:55.578-03	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2fcba317-1998-4045-8ec9-02a870d20d58	\N	John	Oaks	johnoaks@gmail.com	$2b$12$eNn.YdOnYOC/AKtye8/b8O5ZFIvHJGCKjE31vFDlc87uX2qS0uynC	\N	\N	\N	\N	\N	\N	admin	\N	2025-09-23 17:15:19.907-03	\N	2025-09-23 17:15:19.909-03	2025-09-23 17:15:19.909-03	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1756cddf-0944-4546-8696-f482ce63ef12	\N	Brand	Test	brand@test.com	$2b$12$Z8fVLdqV/tljalB0WHpSa.HvDnJbUTsG9yDtkvF7Lg/j2ZlpPxKiG	\N	\N	\N	\N	\N	\N	brand	\N	2025-09-23 17:16:49.029-03	\N	2025-09-23 17:16:49.029-03	2025-09-23 17:16:49.029-03	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	\N	Guilherme	Marques	grrbm3@gmail.com	$2b$12$8sL.TmbXqyQCzs1i9vZwh.wOSMMs53I2A0GIEqls9jmddcs8.hX9e	1988-07-14	5551234567	\N	\N	\N	\N	doctor	2025-09-18 01:16:02.422-03	2025-09-12 00:04:52.884-03	\N	2025-09-12 00:04:52.886-03	2025-09-18 01:16:02.422-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
31ca4227-94d1-43bf-990a-43a14b938609	\N	Daniel	Meursing	dmeursing@yahoo.com	$2b$12$Xwqfbpp7iH0ZD.A5kNteEePRr1.U1KnYF6LOzwOaWk/.he2e0WClC	1995-06-06	9095328622	\N	\N	\N	\N	doctor	2025-09-16 18:17:27.571-03	2025-09-16 01:11:02.5-03	\N	2025-09-16 01:11:02.501-03	2025-09-16 18:17:27.571-03	29e3985c-20cd-45a8-adf7-d6f4cdd21a15	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
63ab9a4a-ddd0-492b-9912-c7a731df19f4	\N	Agora	Vai	agoravaiguilherme@gmail.com	$2b$12$/x.Rp6e7Xblil7Hm1UEisuL/qx6gR0E0/OfG9ZLJ.JhfJBPGmeyf.	1988-07-14	5551234567	\N	\N	\N	\N	patient	2025-09-19 23:54:06.527-03	2025-09-12 00:07:17.457-03	\N	2025-09-12 00:07:17.458-03	2025-09-19 23:54:06.528-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	cus_T5LfsXy7oOQSUZ	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9bc80814-7c2d-4624-9000-72b38a03c6fd	\N	John	Cena	john.cena@gmail.com	$2b$12$456.6LoC2S2zXq2lsWDZFeBWRioa2fmWE1rJGStfc5SJUdnxDgng2	\N	13135135135	\N	\N	\N	\N	patient	\N	2025-09-20 00:58:56.799-03	\N	2025-09-20 00:58:56.8-03	2025-09-20 00:58:58.23-03	\N	\N	\N	\N	\N	\N	cus_T5Ss327UdFeSvZ	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
75fa14f5-b923-436d-aae7-436b3055375e	\N	John	Doe	johndoe@gmail.com	$2b$12$STt8R889RvEuxg9sj9eBKunlX/fRXlUGKK6tT5y97lOhjKBaEi0R.	\N	13413135135	\N	\N	\N	\N	patient	\N	2025-09-20 01:10:32.409-03	\N	2025-09-20 01:10:32.409-03	2025-09-20 01:10:34.046-03	\N	\N	\N	\N	\N	\N	cus_T5T4IzWJAhqAJY	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3b2cadbc-829e-4efd-b0f4-0a4e97c73ebb	\N	John	Cena15	john.cena15@gmail.com	$2b$12$cuJ1VWFC24NLjb2b.O7eRuufggoQZKMNOnLypBpWt.62DyjuFFFCi	\N	31135135	\N	\N	\N	\N	patient	\N	2025-09-24 15:54:28.707-03	\N	2025-09-24 15:54:28.708-03	2025-09-24 15:54:30.584-03	\N	\N	\N	\N	\N	\N	cus_T7CEbkxhppDxPZ	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2b6a9d71-a7be-4216-8d3e-c23aeb1ef9e4	\N	John	Cena2	john.cena2@gmail.com	$2b$12$1uMdKfR2Hak6rDrq.lzExOq/7GA4gr8DVYuC0Shy37vUjYYwrle0u	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-20 01:47:56.533-03	\N	2025-09-20 01:47:56.534-03	2025-09-20 01:47:58.169-03	\N	\N	\N	\N	\N	\N	cus_T5TfFtS39RhtWR	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
036a4efd-f65a-47f5-958e-04d3cdbee596	\N	John	Cena3	john.cena3@gmail.com	$2b$12$LMQvjUELQrnAVqAByioMn.cO5WGEbemsBNvpCknq6FIW93ZXN1skW	\N	134135135135	\N	\N	\N	\N	patient	\N	2025-09-20 01:53:12.806-03	\N	2025-09-20 01:53:12.807-03	2025-09-20 01:53:14.492-03	\N	\N	\N	\N	\N	\N	cus_T5TkR6RVhzCyMq	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
15d13138-9f32-4358-92d8-600d9c6fe558	\N	John	Cena4	john.cena4@gmail.com	$2b$12$L05HYgyJjDrJNpM2HLqar.6vs12J28GRQXmyVzdh.uFkQkqI2dNwG	\N	134135135135	\N	\N	\N	\N	patient	\N	2025-09-20 02:00:44.142-03	\N	2025-09-20 02:00:44.142-03	2025-09-20 02:00:45.775-03	\N	\N	\N	\N	\N	\N	cus_T5TsPd4vX3amWZ	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
df8f4c32-b6ba-4efd-af34-afcc6272a945	\N	John	Cena5	john.cena5@gmail.com	$2b$12$DOi0Rmjszucztj1aiXX6U.SoS3TZL6/Ku19mcZFj/5IL1oyMtFy/C	\N	13513513513	\N	\N	\N	\N	patient	\N	2025-09-20 02:04:14.17-03	\N	2025-09-20 02:04:14.171-03	2025-09-20 02:04:15.758-03	\N	\N	\N	\N	\N	\N	cus_T5TvGppSDIME0Y	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
89b0ef70-7516-4fad-ac4a-37ac74815031	\N	John	Cena8	john.cena8@gmail.com	$2b$12$1ZIDVovRMwBgCASQggfZ6.8hZTPOWnxv1msUoiIOY3ZHcTaMyKzzK	\N	314135135	\N	\N	\N	\N	patient	\N	2025-09-20 02:41:14.576-03	\N	2025-09-20 02:41:14.578-03	2025-09-20 02:41:16.374-03	\N	\N	\N	\N	\N	\N	cus_T5UWNn15jV8GHL	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2551f7cc-8c84-48da-bec3-fde2b39bc3cb	\N	John	Cena9	john.cena9@gmail.com	$2b$12$4GxyexbzBohDjSLoop5YNOaz9qZLXPtVV.fUCIWo/vzdFDcDB96BC	\N	2133134444	\N	\N	\N	\N	patient	\N	2025-09-20 02:47:54.009-03	\N	2025-09-20 02:47:54.01-03	2025-09-20 02:47:54.34-03	\N	\N	\N	\N	\N	\N	cus_T5UdQ9rWhITKky	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
95214474-1920-4524-a513-2325edeb73dc	\N	John	Cena20	john.cena20@gmail.com	$2b$12$H.QzODQWEv3GmlW2Ntcoh.af7Cg5uOLZRtNGbQnMJOwHvopg2b9mi	\N	31413513	\N	\N	\N	\N	patient	\N	2025-09-24 17:37:14.136-03	\N	2025-09-24 17:37:14.137-03	2025-09-24 17:37:16.137-03	\N	\N	\N	\N	\N	\N	cus_T7Dsiewt6c6L0N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2d9fa149-b808-4e9e-92a1-023b7ae673fd	\N	Guilherme	Reis	grrbm4@gmail.com	$2b$12$1cGbphDE9ySZ.tfH.7yBHum58Lb4Sklx7yyfbsW5nPS.CLtfzugaG	\N	135135135	\N	\N	\N	\N	brand	\N	2025-09-23 22:30:57.654-03	\N	2025-09-23 22:30:57.656-03	2025-09-23 22:30:57.887-03	\N	\N	\N	\N	\N	\N	\N	f	d88cfb09fd7d0626f34b5330e93d695601d65ccfc43b1479e291b3862a31aa42	2025-09-24 22:30:57.886-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
15f6c10e-69a7-449a-99be-19e84e8aa0ce	\N	Test2	User2	test2@example.com	$2b$12$ZibO9SlRpS.bbfvGMtetAe.uPqaQdCcUraDgg4lUWdxZOG8lGZssm	\N	123-456-7890	\N	\N	\N	\N	brand	\N	2025-09-25 15:01:27.22-03	\N	2025-09-25 15:01:27.22-03	2025-09-25 15:01:27.608-03	6cef6794-7acb-4529-bb41-cef46849120b	\N	\N	\N	\N	\N	\N	f	835ec90cd021f7d5c96538f1747ef59ff5f458c855fc207b73021ee7ecdfd288	2025-09-26 15:01:27.606-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
047ff79b-acfc-4513-8afc-5013797d113c	\N	Guilherme	Reis	grrbm5@gmail.com	$2b$12$Y4jF0wGqdnmYFHK8HOUatO40ETp8jPhlJwyQ4hQHGo1zaE6bOZj6O	\N	135135135	\N	\N	\N	\N	brand	\N	2025-09-23 22:36:37.192-03	\N	2025-09-23 22:36:37.193-03	2025-09-23 22:39:38.16-03	\N	\N	\N	\N	\N	\N	\N	t	28bfe059038dadbc38c6d3d2d503b5f3de5b21e37aacbb229a75a785ac3ef373	2025-09-24 22:36:37.421-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4edbbd82-9bb1-401d-bd9b-ab4565e3eeee	\N	134	134134	edaf@gadg.com	$2b$12$JSg62LGtKQ10qrm2R8xrcO9z3D2xs95lmtQITeqiW3nn5nXdGGZZu	\N	134135135	\N	\N	\N	\N	patient	\N	2025-09-25 23:17:16.235-03	\N	2025-09-25 23:17:16.236-03	2025-09-25 23:17:18.454-03	\N	\N	\N	\N	\N	\N	cus_T7gar2eOII63oC	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cea7b7d4-63eb-4d48-8e4e-80da1fe6b530	\N	john	brand	johnbrand@gmail.com	$2b$12$o0eh.mZQT74yc15RGj3Yk.wDT1BcLIA7gqU3UfUCFQap.GfgZixVW	\N	+55135135135	\N	\N	\N	\N	brand	\N	2025-09-25 15:10:42.053-03	\N	2025-09-25 15:10:42.054-03	2025-09-25 15:10:42.436-03	c7d2c458-d3e4-41e1-b620-f05c338e7efc	\N	\N	\N	\N	\N	\N	f	63040e5edf4ae71204b61366b57dc8e5056b7b4196a462bfd8b4aa86a130f9f2	2025-09-26 15:10:42.434-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
643d787f-4304-445d-b974-1ba4fa0b2e70	\N	Daniel	Meursing	dkmeursing@gmail.com	$2b$12$WtcurGvZIQMXN4Gx5V7/s.Xx6DJja8T8YtqS6WX0Q57QAB5z2SflS	\N	9095321861	\N	\N	\N	\N	brand	2025-09-25 01:58:03.525-03	2025-09-24 02:25:19.148-03	\N	2025-09-24 02:25:19.148-03	2025-09-25 01:58:03.525-03	\N	\N	\N	\N	\N	\N	\N	t	2d86fab8552f55f051546495d541a21ba4329675daae5fdf572fa162d57a5b97	2025-09-25 02:25:19.185-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
01d77389-3414-48df-b39a-e0dfcfdff359	\N	smeagol	smeagol	smeagol@gmail.com	$2b$12$lOEcZ3c.JclANvBD1TU/l.SQMJccI9C7DLdO1eoHEZdfUAHY5RktK	\N	135135135	\N	\N	\N	\N	brand	\N	2025-09-25 17:22:51.505-03	\N	2025-09-25 17:22:51.506-03	2025-09-25 17:22:51.701-03	\N	\N	\N	\N	\N	\N	\N	f	023fa5c31b7e505eecd00d23994eab076b3bb7a5466e7be0af33c39a27cc3939	2025-09-26 17:22:51.7-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ab53f6ca-471c-42cb-b421-953142ac08ef	\N	Jdaf	adfa	adfadf@gmail.com	$2b$12$9Cup9hz.q.ZIovrW0mf3POVu9w.8aBao7rkmvQBP4Y.G5VizeHz/6	\N	135135135	\N	\N	\N	\N	patient	\N	2025-09-25 22:44:37.893-03	\N	2025-09-25 22:44:37.894-03	2025-09-25 22:44:39.868-03	\N	\N	\N	\N	\N	\N	cus_T7g466l6g7kqRW	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0f54bfc7-b824-4eed-9b2f-259a3a6c6438	\N	Sneh	Dhruv	sneh@gmail.com	$2b$12$anh91NIavsltwXeh0dyFXO6pwUoxtFhT.Routo3GApDlHU4qGn62O	\N	9329393930	\N	\N	\N	\N	brand	\N	2025-09-26 01:37:12.734-03	\N	2025-09-26 01:37:12.734-03	2025-09-26 01:37:12.747-03	\N	\N	\N	\N	\N	\N	\N	f	c41b422f449596620488bf2f75677e98734932476b114f9d48ef4ebe3ec6f797	2025-09-27 01:37:12.747-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
36546a22-fe6b-40ee-8da8-1aaa4014da4a	\N	Test	Brand	testbrand@gmail.com	$2b$12$FhhygPNg2R3wnfZOU.vvsOY8jDI4h2QFeH492I.5P35a46I832moq	\N	+1 555 1234	\N	\N	\N	\N	brand	2025-09-30 00:53:36.019-03	2025-09-29 15:58:48.621-03	\N	2025-09-29 15:58:48.624-03	2025-09-30 00:53:36.019-03	9feac14b-0aa1-48d5-bb32-14ba1f36d9bd	\N	\N	\N	\N	\N	\N	t	83be24c00c22e5eb82089a73c19136d2e4ecf5c6e8aff0cd8222ae3a870bda4c	2025-09-30 15:58:49.022-03	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7c6f0539-e04d-4f6f-a693-f2b34bb386fd	\N	Daniel	Meursing	daniel@premierstaff.com	$2b$12$JsUpUTyjbeJZ8zZuscj3F.PmknzO00iqc/goEZaL2eA232VfusS9q	\N	3232502211	\N	\N	\N	\N	brand	2025-10-06 17:38:04.392-03	2025-10-02 15:54:21.72-03	\N	2025-10-02 15:54:21.72-03	2025-10-06 17:38:04.392-03	2be7b60e-37d6-4398-b89c-808a5bac5a40	\N	\N	\N	\N	\N	cus_TAC2yYcAfBKiZn	t	3e9a36671d5ff110f27abb76ee478ee9042d02b0813f9548a1e0f3f76b0d8216	2025-10-03 15:54:21.945-03	\N	f	wellness	premierstaff.com	professional	high-definition	Controlled Substances	2500.00	downpayment_professional	Discounted Professional First Month	2500.00	2025-10-05 18:53:43.33-03
1f8acc57-f137-4b51-ad44-cad317ba43cf	\N	Guilherme	Reis	grrbm2@gmail.com	$2b$12$APeX9mdS5Zd8io38i6GUzOkmO5agEJzRXy7VMWKG/5f0QuuH1k60S	\N	135135135135	\N	\N	\N	\N	brand	2025-10-10 00:09:02.569-03	2025-09-23 23:30:19.525-03	\N	2025-09-23 23:30:19.526-03	2025-10-10 00:09:02.57-03	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	cus_T9px09A59xFiZf	t	8b41b26b7b72a0164170fd36ff281e485fa07523c985c79ac3624a0451333b01	2025-09-24 23:30:19.541-03	\N	f	\N	\N	standard	standard	Standard	3500.00	downpayment_standard	Standard First Month	3500.00	2025-10-09 16:20:38.391-03
\.


--
-- TOC entry 3967 (class 2606 OID 51012)
-- Name: BrandSubscriptionPlans BrandSubscriptionPlans_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscriptionPlans"
    ADD CONSTRAINT "BrandSubscriptionPlans_pkey" PRIMARY KEY (id);


--
-- TOC entry 3701 (class 2606 OID 51014)
-- Name: BrandSubscription BrandSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_pkey" PRIMARY KEY (id);


--
-- TOC entry 3703 (class 2606 OID 322336)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3705 (class 2606 OID 322338)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key1" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3707 (class 2606 OID 322340)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key10" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3709 (class 2606 OID 322222)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key100" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3711 (class 2606 OID 322194)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key101" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3713 (class 2606 OID 322220)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key102" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3715 (class 2606 OID 322196)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key103" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3717 (class 2606 OID 322198)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key104" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3719 (class 2606 OID 322218)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key105" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3721 (class 2606 OID 322200)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key106" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3723 (class 2606 OID 322216)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key107" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3725 (class 2606 OID 322202)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key108" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3727 (class 2606 OID 322214)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key109" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3729 (class 2606 OID 322342)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key11" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3731 (class 2606 OID 322204)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key110" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3733 (class 2606 OID 322212)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key111" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3735 (class 2606 OID 322206)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key112" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3737 (class 2606 OID 322210)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key113" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3739 (class 2606 OID 322208)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key114" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3741 (class 2606 OID 322404)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key115" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3743 (class 2606 OID 322352)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key116" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3745 (class 2606 OID 322406)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key117" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3747 (class 2606 OID 322350)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key118" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3749 (class 2606 OID 322408)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key119" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3751 (class 2606 OID 322344)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key12" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3753 (class 2606 OID 322168)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key120" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3755 (class 2606 OID 322410)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key121" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3757 (class 2606 OID 322412)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key122" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3759 (class 2606 OID 322166)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key123" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3761 (class 2606 OID 322414)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key124" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3763 (class 2606 OID 322416)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key125" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3765 (class 2606 OID 322164)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key126" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3767 (class 2606 OID 322418)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key127" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3769 (class 2606 OID 322162)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key128" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3771 (class 2606 OID 322420)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key129" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3773 (class 2606 OID 322346)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key13" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3775 (class 2606 OID 322422)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key130" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3777 (class 2606 OID 322160)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key131" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3779 (class 2606 OID 322348)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key14" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3781 (class 2606 OID 322374)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key15" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3783 (class 2606 OID 322376)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key16" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3785 (class 2606 OID 322378)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key17" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3787 (class 2606 OID 322380)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key18" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3789 (class 2606 OID 322382)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key19" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3791 (class 2606 OID 322384)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key2" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3793 (class 2606 OID 322260)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key20" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3795 (class 2606 OID 322262)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key21" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3797 (class 2606 OID 322264)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key22" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3799 (class 2606 OID 322266)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key23" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3801 (class 2606 OID 322268)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key24" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3803 (class 2606 OID 322270)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key25" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3805 (class 2606 OID 322272)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key26" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3807 (class 2606 OID 322274)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key27" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3809 (class 2606 OID 322276)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key28" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3811 (class 2606 OID 322278)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key29" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3813 (class 2606 OID 322280)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key3" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3815 (class 2606 OID 322282)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key30" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3817 (class 2606 OID 322284)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key31" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3819 (class 2606 OID 322286)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key32" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3821 (class 2606 OID 322288)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key33" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3823 (class 2606 OID 322290)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key34" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3825 (class 2606 OID 322292)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key35" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3827 (class 2606 OID 322294)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key36" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3829 (class 2606 OID 322296)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key37" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3831 (class 2606 OID 322298)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key38" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3833 (class 2606 OID 322300)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key39" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3835 (class 2606 OID 322302)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key4" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3837 (class 2606 OID 322304)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key40" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3839 (class 2606 OID 322306)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key41" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3841 (class 2606 OID 322308)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key42" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3843 (class 2606 OID 322320)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key43" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3845 (class 2606 OID 322334)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key44" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3847 (class 2606 OID 322322)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key45" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3849 (class 2606 OID 322324)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key46" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3851 (class 2606 OID 322332)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key47" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3853 (class 2606 OID 322326)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key48" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3855 (class 2606 OID 322330)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key49" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3857 (class 2606 OID 322310)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key5" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3859 (class 2606 OID 322328)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key50" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3861 (class 2606 OID 322258)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key51" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3863 (class 2606 OID 322386)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key52" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3865 (class 2606 OID 322388)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key53" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3867 (class 2606 OID 322256)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key54" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3869 (class 2606 OID 322390)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key55" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3871 (class 2606 OID 322392)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key56" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3873 (class 2606 OID 322394)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key57" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3875 (class 2606 OID 322254)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key58" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3877 (class 2606 OID 322396)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key59" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3879 (class 2606 OID 322312)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key6" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3881 (class 2606 OID 322252)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key60" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3883 (class 2606 OID 322398)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key61" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3885 (class 2606 OID 322400)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key62" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3887 (class 2606 OID 322402)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key63" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3889 (class 2606 OID 322250)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key64" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3891 (class 2606 OID 322354)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key65" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3893 (class 2606 OID 322356)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key66" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3895 (class 2606 OID 322358)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key67" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3897 (class 2606 OID 322248)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key68" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3899 (class 2606 OID 322360)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key69" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3901 (class 2606 OID 322314)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key7" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3903 (class 2606 OID 322246)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key70" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3905 (class 2606 OID 322362)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key71" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3907 (class 2606 OID 322244)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key72" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3909 (class 2606 OID 322364)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key73" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3911 (class 2606 OID 322242)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key74" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3913 (class 2606 OID 322366)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key75" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3915 (class 2606 OID 322240)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key76" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3917 (class 2606 OID 322368)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key77" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3919 (class 2606 OID 322238)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key78" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3921 (class 2606 OID 322370)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key79" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3923 (class 2606 OID 322316)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key8" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3925 (class 2606 OID 322236)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key80" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3927 (class 2606 OID 322372)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key81" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3929 (class 2606 OID 322170)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key82" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3931 (class 2606 OID 322234)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key83" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3933 (class 2606 OID 322172)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key84" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3935 (class 2606 OID 322174)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key85" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3937 (class 2606 OID 322232)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key86" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3939 (class 2606 OID 322176)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key87" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3941 (class 2606 OID 322178)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key88" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3943 (class 2606 OID 322180)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key89" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3945 (class 2606 OID 322318)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key9" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3947 (class 2606 OID 322230)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key90" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3949 (class 2606 OID 322182)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key91" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3951 (class 2606 OID 322184)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key92" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3953 (class 2606 OID 322228)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key93" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3955 (class 2606 OID 322186)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key94" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3957 (class 2606 OID 322226)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key95" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3959 (class 2606 OID 322188)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key96" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3961 (class 2606 OID 322224)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key97" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3963 (class 2606 OID 322190)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key98" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3965 (class 2606 OID 322192)
-- Name: BrandSubscription BrandSubscription_stripeSubscriptionId_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_stripeSubscriptionId_key99" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 3969 (class 2606 OID 51102)
-- Name: BrandTreatments BrandTreatments_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandTreatments"
    ADD CONSTRAINT "BrandTreatments_pkey" PRIMARY KEY (id);


--
-- TOC entry 3972 (class 2606 OID 51104)
-- Name: Clinic Clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_pkey" PRIMARY KEY (id);


--
-- TOC entry 3974 (class 2606 OID 319780)
-- Name: Clinic Clinic_slug_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key" UNIQUE (slug);


--
-- TOC entry 3976 (class 2606 OID 319782)
-- Name: Clinic Clinic_slug_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key1" UNIQUE (slug);


--
-- TOC entry 3978 (class 2606 OID 319784)
-- Name: Clinic Clinic_slug_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key10" UNIQUE (slug);


--
-- TOC entry 3980 (class 2606 OID 319786)
-- Name: Clinic Clinic_slug_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key100" UNIQUE (slug);


--
-- TOC entry 3982 (class 2606 OID 319788)
-- Name: Clinic Clinic_slug_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key101" UNIQUE (slug);


--
-- TOC entry 3984 (class 2606 OID 319790)
-- Name: Clinic Clinic_slug_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key102" UNIQUE (slug);


--
-- TOC entry 3986 (class 2606 OID 319792)
-- Name: Clinic Clinic_slug_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key103" UNIQUE (slug);


--
-- TOC entry 3988 (class 2606 OID 319794)
-- Name: Clinic Clinic_slug_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key104" UNIQUE (slug);


--
-- TOC entry 3990 (class 2606 OID 319796)
-- Name: Clinic Clinic_slug_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key105" UNIQUE (slug);


--
-- TOC entry 3992 (class 2606 OID 319798)
-- Name: Clinic Clinic_slug_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key106" UNIQUE (slug);


--
-- TOC entry 3994 (class 2606 OID 319800)
-- Name: Clinic Clinic_slug_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key107" UNIQUE (slug);


--
-- TOC entry 3996 (class 2606 OID 319802)
-- Name: Clinic Clinic_slug_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key108" UNIQUE (slug);


--
-- TOC entry 3998 (class 2606 OID 319804)
-- Name: Clinic Clinic_slug_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key109" UNIQUE (slug);


--
-- TOC entry 4000 (class 2606 OID 319806)
-- Name: Clinic Clinic_slug_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key11" UNIQUE (slug);


--
-- TOC entry 4002 (class 2606 OID 319808)
-- Name: Clinic Clinic_slug_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key110" UNIQUE (slug);


--
-- TOC entry 4004 (class 2606 OID 319810)
-- Name: Clinic Clinic_slug_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key111" UNIQUE (slug);


--
-- TOC entry 4006 (class 2606 OID 319812)
-- Name: Clinic Clinic_slug_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key112" UNIQUE (slug);


--
-- TOC entry 4008 (class 2606 OID 319814)
-- Name: Clinic Clinic_slug_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key113" UNIQUE (slug);


--
-- TOC entry 4010 (class 2606 OID 319816)
-- Name: Clinic Clinic_slug_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key114" UNIQUE (slug);


--
-- TOC entry 4012 (class 2606 OID 319818)
-- Name: Clinic Clinic_slug_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key115" UNIQUE (slug);


--
-- TOC entry 4014 (class 2606 OID 319820)
-- Name: Clinic Clinic_slug_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key116" UNIQUE (slug);


--
-- TOC entry 4016 (class 2606 OID 319822)
-- Name: Clinic Clinic_slug_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key117" UNIQUE (slug);


--
-- TOC entry 4018 (class 2606 OID 319824)
-- Name: Clinic Clinic_slug_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key118" UNIQUE (slug);


--
-- TOC entry 4020 (class 2606 OID 319826)
-- Name: Clinic Clinic_slug_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key119" UNIQUE (slug);


--
-- TOC entry 4022 (class 2606 OID 319828)
-- Name: Clinic Clinic_slug_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key12" UNIQUE (slug);


--
-- TOC entry 4024 (class 2606 OID 319830)
-- Name: Clinic Clinic_slug_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key120" UNIQUE (slug);


--
-- TOC entry 4026 (class 2606 OID 319832)
-- Name: Clinic Clinic_slug_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key121" UNIQUE (slug);


--
-- TOC entry 4028 (class 2606 OID 319834)
-- Name: Clinic Clinic_slug_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key122" UNIQUE (slug);


--
-- TOC entry 4030 (class 2606 OID 319836)
-- Name: Clinic Clinic_slug_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key123" UNIQUE (slug);


--
-- TOC entry 4032 (class 2606 OID 319924)
-- Name: Clinic Clinic_slug_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key124" UNIQUE (slug);


--
-- TOC entry 4034 (class 2606 OID 319926)
-- Name: Clinic Clinic_slug_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key125" UNIQUE (slug);


--
-- TOC entry 4036 (class 2606 OID 319928)
-- Name: Clinic Clinic_slug_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key126" UNIQUE (slug);


--
-- TOC entry 4038 (class 2606 OID 319930)
-- Name: Clinic Clinic_slug_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key127" UNIQUE (slug);


--
-- TOC entry 4040 (class 2606 OID 319932)
-- Name: Clinic Clinic_slug_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key128" UNIQUE (slug);


--
-- TOC entry 4042 (class 2606 OID 319934)
-- Name: Clinic Clinic_slug_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key129" UNIQUE (slug);


--
-- TOC entry 4044 (class 2606 OID 319936)
-- Name: Clinic Clinic_slug_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key13" UNIQUE (slug);


--
-- TOC entry 4046 (class 2606 OID 319938)
-- Name: Clinic Clinic_slug_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key130" UNIQUE (slug);


--
-- TOC entry 4048 (class 2606 OID 319940)
-- Name: Clinic Clinic_slug_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key131" UNIQUE (slug);


--
-- TOC entry 4050 (class 2606 OID 319942)
-- Name: Clinic Clinic_slug_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key132" UNIQUE (slug);


--
-- TOC entry 4052 (class 2606 OID 319944)
-- Name: Clinic Clinic_slug_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key133" UNIQUE (slug);


--
-- TOC entry 4054 (class 2606 OID 319946)
-- Name: Clinic Clinic_slug_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key134" UNIQUE (slug);


--
-- TOC entry 4056 (class 2606 OID 319948)
-- Name: Clinic Clinic_slug_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key135" UNIQUE (slug);


--
-- TOC entry 4058 (class 2606 OID 319950)
-- Name: Clinic Clinic_slug_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key136" UNIQUE (slug);


--
-- TOC entry 4060 (class 2606 OID 319952)
-- Name: Clinic Clinic_slug_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key137" UNIQUE (slug);


--
-- TOC entry 4062 (class 2606 OID 319954)
-- Name: Clinic Clinic_slug_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key138" UNIQUE (slug);


--
-- TOC entry 4064 (class 2606 OID 319956)
-- Name: Clinic Clinic_slug_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key139" UNIQUE (slug);


--
-- TOC entry 4066 (class 2606 OID 319958)
-- Name: Clinic Clinic_slug_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key14" UNIQUE (slug);


--
-- TOC entry 4068 (class 2606 OID 319960)
-- Name: Clinic Clinic_slug_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key140" UNIQUE (slug);


--
-- TOC entry 4070 (class 2606 OID 319962)
-- Name: Clinic Clinic_slug_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key141" UNIQUE (slug);


--
-- TOC entry 4072 (class 2606 OID 319964)
-- Name: Clinic Clinic_slug_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key142" UNIQUE (slug);


--
-- TOC entry 4074 (class 2606 OID 319966)
-- Name: Clinic Clinic_slug_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key143" UNIQUE (slug);


--
-- TOC entry 4076 (class 2606 OID 319968)
-- Name: Clinic Clinic_slug_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key144" UNIQUE (slug);


--
-- TOC entry 4078 (class 2606 OID 319970)
-- Name: Clinic Clinic_slug_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key145" UNIQUE (slug);


--
-- TOC entry 4080 (class 2606 OID 319972)
-- Name: Clinic Clinic_slug_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key146" UNIQUE (slug);


--
-- TOC entry 4082 (class 2606 OID 320056)
-- Name: Clinic Clinic_slug_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key147" UNIQUE (slug);


--
-- TOC entry 4084 (class 2606 OID 320058)
-- Name: Clinic Clinic_slug_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key148" UNIQUE (slug);


--
-- TOC entry 4086 (class 2606 OID 320060)
-- Name: Clinic Clinic_slug_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key149" UNIQUE (slug);


--
-- TOC entry 4088 (class 2606 OID 320062)
-- Name: Clinic Clinic_slug_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key15" UNIQUE (slug);


--
-- TOC entry 4090 (class 2606 OID 320064)
-- Name: Clinic Clinic_slug_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key150" UNIQUE (slug);


--
-- TOC entry 4092 (class 2606 OID 320066)
-- Name: Clinic Clinic_slug_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key151" UNIQUE (slug);


--
-- TOC entry 4094 (class 2606 OID 320068)
-- Name: Clinic Clinic_slug_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key152" UNIQUE (slug);


--
-- TOC entry 4096 (class 2606 OID 320070)
-- Name: Clinic Clinic_slug_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key153" UNIQUE (slug);


--
-- TOC entry 4098 (class 2606 OID 320072)
-- Name: Clinic Clinic_slug_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key154" UNIQUE (slug);


--
-- TOC entry 4100 (class 2606 OID 320074)
-- Name: Clinic Clinic_slug_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key155" UNIQUE (slug);


--
-- TOC entry 4102 (class 2606 OID 320076)
-- Name: Clinic Clinic_slug_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key156" UNIQUE (slug);


--
-- TOC entry 4104 (class 2606 OID 320078)
-- Name: Clinic Clinic_slug_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key157" UNIQUE (slug);


--
-- TOC entry 4106 (class 2606 OID 320080)
-- Name: Clinic Clinic_slug_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key158" UNIQUE (slug);


--
-- TOC entry 4108 (class 2606 OID 320082)
-- Name: Clinic Clinic_slug_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key159" UNIQUE (slug);


--
-- TOC entry 4110 (class 2606 OID 320084)
-- Name: Clinic Clinic_slug_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key16" UNIQUE (slug);


--
-- TOC entry 4112 (class 2606 OID 320086)
-- Name: Clinic Clinic_slug_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key160" UNIQUE (slug);


--
-- TOC entry 4114 (class 2606 OID 320088)
-- Name: Clinic Clinic_slug_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key161" UNIQUE (slug);


--
-- TOC entry 4116 (class 2606 OID 320090)
-- Name: Clinic Clinic_slug_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key162" UNIQUE (slug);


--
-- TOC entry 4118 (class 2606 OID 320092)
-- Name: Clinic Clinic_slug_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key163" UNIQUE (slug);


--
-- TOC entry 4120 (class 2606 OID 320094)
-- Name: Clinic Clinic_slug_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key164" UNIQUE (slug);


--
-- TOC entry 4122 (class 2606 OID 320096)
-- Name: Clinic Clinic_slug_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key165" UNIQUE (slug);


--
-- TOC entry 4124 (class 2606 OID 320098)
-- Name: Clinic Clinic_slug_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key166" UNIQUE (slug);


--
-- TOC entry 4126 (class 2606 OID 320100)
-- Name: Clinic Clinic_slug_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key167" UNIQUE (slug);


--
-- TOC entry 4128 (class 2606 OID 320102)
-- Name: Clinic Clinic_slug_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key168" UNIQUE (slug);


--
-- TOC entry 4130 (class 2606 OID 320104)
-- Name: Clinic Clinic_slug_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key169" UNIQUE (slug);


--
-- TOC entry 4132 (class 2606 OID 320106)
-- Name: Clinic Clinic_slug_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key17" UNIQUE (slug);


--
-- TOC entry 4134 (class 2606 OID 320108)
-- Name: Clinic Clinic_slug_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key170" UNIQUE (slug);


--
-- TOC entry 4136 (class 2606 OID 320110)
-- Name: Clinic Clinic_slug_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key171" UNIQUE (slug);


--
-- TOC entry 4138 (class 2606 OID 320112)
-- Name: Clinic Clinic_slug_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key172" UNIQUE (slug);


--
-- TOC entry 4140 (class 2606 OID 320114)
-- Name: Clinic Clinic_slug_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key173" UNIQUE (slug);


--
-- TOC entry 4142 (class 2606 OID 320116)
-- Name: Clinic Clinic_slug_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key174" UNIQUE (slug);


--
-- TOC entry 4144 (class 2606 OID 320118)
-- Name: Clinic Clinic_slug_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key175" UNIQUE (slug);


--
-- TOC entry 4146 (class 2606 OID 320120)
-- Name: Clinic Clinic_slug_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key176" UNIQUE (slug);


--
-- TOC entry 4148 (class 2606 OID 320122)
-- Name: Clinic Clinic_slug_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key177" UNIQUE (slug);


--
-- TOC entry 4150 (class 2606 OID 320124)
-- Name: Clinic Clinic_slug_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key178" UNIQUE (slug);


--
-- TOC entry 4152 (class 2606 OID 320126)
-- Name: Clinic Clinic_slug_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key179" UNIQUE (slug);


--
-- TOC entry 4154 (class 2606 OID 320128)
-- Name: Clinic Clinic_slug_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key18" UNIQUE (slug);


--
-- TOC entry 4156 (class 2606 OID 320130)
-- Name: Clinic Clinic_slug_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key180" UNIQUE (slug);


--
-- TOC entry 4158 (class 2606 OID 320132)
-- Name: Clinic Clinic_slug_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key181" UNIQUE (slug);


--
-- TOC entry 4160 (class 2606 OID 320134)
-- Name: Clinic Clinic_slug_key182; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key182" UNIQUE (slug);


--
-- TOC entry 4162 (class 2606 OID 320136)
-- Name: Clinic Clinic_slug_key183; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key183" UNIQUE (slug);


--
-- TOC entry 4164 (class 2606 OID 320138)
-- Name: Clinic Clinic_slug_key184; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key184" UNIQUE (slug);


--
-- TOC entry 4166 (class 2606 OID 320140)
-- Name: Clinic Clinic_slug_key185; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key185" UNIQUE (slug);


--
-- TOC entry 4168 (class 2606 OID 320142)
-- Name: Clinic Clinic_slug_key186; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key186" UNIQUE (slug);


--
-- TOC entry 4170 (class 2606 OID 320144)
-- Name: Clinic Clinic_slug_key187; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key187" UNIQUE (slug);


--
-- TOC entry 4172 (class 2606 OID 320146)
-- Name: Clinic Clinic_slug_key188; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key188" UNIQUE (slug);


--
-- TOC entry 4174 (class 2606 OID 320148)
-- Name: Clinic Clinic_slug_key189; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key189" UNIQUE (slug);


--
-- TOC entry 4176 (class 2606 OID 320150)
-- Name: Clinic Clinic_slug_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key19" UNIQUE (slug);


--
-- TOC entry 4178 (class 2606 OID 320152)
-- Name: Clinic Clinic_slug_key190; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key190" UNIQUE (slug);


--
-- TOC entry 4180 (class 2606 OID 320154)
-- Name: Clinic Clinic_slug_key191; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key191" UNIQUE (slug);


--
-- TOC entry 4182 (class 2606 OID 320156)
-- Name: Clinic Clinic_slug_key192; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key192" UNIQUE (slug);


--
-- TOC entry 4184 (class 2606 OID 320158)
-- Name: Clinic Clinic_slug_key193; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key193" UNIQUE (slug);


--
-- TOC entry 4186 (class 2606 OID 320160)
-- Name: Clinic Clinic_slug_key194; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key194" UNIQUE (slug);


--
-- TOC entry 4188 (class 2606 OID 320162)
-- Name: Clinic Clinic_slug_key195; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key195" UNIQUE (slug);


--
-- TOC entry 4190 (class 2606 OID 320164)
-- Name: Clinic Clinic_slug_key196; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key196" UNIQUE (slug);


--
-- TOC entry 4192 (class 2606 OID 320166)
-- Name: Clinic Clinic_slug_key197; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key197" UNIQUE (slug);


--
-- TOC entry 4194 (class 2606 OID 320168)
-- Name: Clinic Clinic_slug_key198; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key198" UNIQUE (slug);


--
-- TOC entry 4196 (class 2606 OID 320170)
-- Name: Clinic Clinic_slug_key199; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key199" UNIQUE (slug);


--
-- TOC entry 4198 (class 2606 OID 320172)
-- Name: Clinic Clinic_slug_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key2" UNIQUE (slug);


--
-- TOC entry 4200 (class 2606 OID 320174)
-- Name: Clinic Clinic_slug_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key20" UNIQUE (slug);


--
-- TOC entry 4202 (class 2606 OID 320176)
-- Name: Clinic Clinic_slug_key200; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key200" UNIQUE (slug);


--
-- TOC entry 4204 (class 2606 OID 320178)
-- Name: Clinic Clinic_slug_key201; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key201" UNIQUE (slug);


--
-- TOC entry 4206 (class 2606 OID 320180)
-- Name: Clinic Clinic_slug_key202; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key202" UNIQUE (slug);


--
-- TOC entry 4208 (class 2606 OID 320182)
-- Name: Clinic Clinic_slug_key203; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key203" UNIQUE (slug);


--
-- TOC entry 4210 (class 2606 OID 320184)
-- Name: Clinic Clinic_slug_key204; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key204" UNIQUE (slug);


--
-- TOC entry 4212 (class 2606 OID 320186)
-- Name: Clinic Clinic_slug_key205; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key205" UNIQUE (slug);


--
-- TOC entry 4214 (class 2606 OID 320188)
-- Name: Clinic Clinic_slug_key206; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key206" UNIQUE (slug);


--
-- TOC entry 4216 (class 2606 OID 320190)
-- Name: Clinic Clinic_slug_key207; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key207" UNIQUE (slug);


--
-- TOC entry 4218 (class 2606 OID 320192)
-- Name: Clinic Clinic_slug_key208; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key208" UNIQUE (slug);


--
-- TOC entry 4220 (class 2606 OID 320194)
-- Name: Clinic Clinic_slug_key209; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key209" UNIQUE (slug);


--
-- TOC entry 4222 (class 2606 OID 320196)
-- Name: Clinic Clinic_slug_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key21" UNIQUE (slug);


--
-- TOC entry 4224 (class 2606 OID 320198)
-- Name: Clinic Clinic_slug_key210; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key210" UNIQUE (slug);


--
-- TOC entry 4226 (class 2606 OID 320200)
-- Name: Clinic Clinic_slug_key211; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key211" UNIQUE (slug);


--
-- TOC entry 4228 (class 2606 OID 320202)
-- Name: Clinic Clinic_slug_key212; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key212" UNIQUE (slug);


--
-- TOC entry 4230 (class 2606 OID 320204)
-- Name: Clinic Clinic_slug_key213; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key213" UNIQUE (slug);


--
-- TOC entry 4232 (class 2606 OID 320206)
-- Name: Clinic Clinic_slug_key214; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key214" UNIQUE (slug);


--
-- TOC entry 4234 (class 2606 OID 320208)
-- Name: Clinic Clinic_slug_key215; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key215" UNIQUE (slug);


--
-- TOC entry 4236 (class 2606 OID 320210)
-- Name: Clinic Clinic_slug_key216; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key216" UNIQUE (slug);


--
-- TOC entry 4238 (class 2606 OID 320016)
-- Name: Clinic Clinic_slug_key217; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key217" UNIQUE (slug);


--
-- TOC entry 4240 (class 2606 OID 320018)
-- Name: Clinic Clinic_slug_key218; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key218" UNIQUE (slug);


--
-- TOC entry 4242 (class 2606 OID 320020)
-- Name: Clinic Clinic_slug_key219; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key219" UNIQUE (slug);


--
-- TOC entry 4244 (class 2606 OID 320022)
-- Name: Clinic Clinic_slug_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key22" UNIQUE (slug);


--
-- TOC entry 4246 (class 2606 OID 320024)
-- Name: Clinic Clinic_slug_key220; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key220" UNIQUE (slug);


--
-- TOC entry 4248 (class 2606 OID 320026)
-- Name: Clinic Clinic_slug_key221; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key221" UNIQUE (slug);


--
-- TOC entry 4250 (class 2606 OID 320028)
-- Name: Clinic Clinic_slug_key222; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key222" UNIQUE (slug);


--
-- TOC entry 4252 (class 2606 OID 320030)
-- Name: Clinic Clinic_slug_key223; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key223" UNIQUE (slug);


--
-- TOC entry 4254 (class 2606 OID 320032)
-- Name: Clinic Clinic_slug_key224; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key224" UNIQUE (slug);


--
-- TOC entry 4256 (class 2606 OID 320034)
-- Name: Clinic Clinic_slug_key225; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key225" UNIQUE (slug);


--
-- TOC entry 4258 (class 2606 OID 320036)
-- Name: Clinic Clinic_slug_key226; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key226" UNIQUE (slug);


--
-- TOC entry 4260 (class 2606 OID 320038)
-- Name: Clinic Clinic_slug_key227; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key227" UNIQUE (slug);


--
-- TOC entry 4262 (class 2606 OID 320040)
-- Name: Clinic Clinic_slug_key228; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key228" UNIQUE (slug);


--
-- TOC entry 4264 (class 2606 OID 320042)
-- Name: Clinic Clinic_slug_key229; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key229" UNIQUE (slug);


--
-- TOC entry 4266 (class 2606 OID 320044)
-- Name: Clinic Clinic_slug_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key23" UNIQUE (slug);


--
-- TOC entry 4268 (class 2606 OID 320046)
-- Name: Clinic Clinic_slug_key230; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key230" UNIQUE (slug);


--
-- TOC entry 4270 (class 2606 OID 320048)
-- Name: Clinic Clinic_slug_key231; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key231" UNIQUE (slug);


--
-- TOC entry 4272 (class 2606 OID 320050)
-- Name: Clinic Clinic_slug_key232; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key232" UNIQUE (slug);


--
-- TOC entry 4274 (class 2606 OID 320222)
-- Name: Clinic Clinic_slug_key233; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key233" UNIQUE (slug);


--
-- TOC entry 4276 (class 2606 OID 320224)
-- Name: Clinic Clinic_slug_key234; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key234" UNIQUE (slug);


--
-- TOC entry 4278 (class 2606 OID 320226)
-- Name: Clinic Clinic_slug_key235; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key235" UNIQUE (slug);


--
-- TOC entry 4280 (class 2606 OID 320228)
-- Name: Clinic Clinic_slug_key236; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key236" UNIQUE (slug);


--
-- TOC entry 4282 (class 2606 OID 320230)
-- Name: Clinic Clinic_slug_key237; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key237" UNIQUE (slug);


--
-- TOC entry 4284 (class 2606 OID 320232)
-- Name: Clinic Clinic_slug_key238; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key238" UNIQUE (slug);


--
-- TOC entry 4286 (class 2606 OID 320254)
-- Name: Clinic Clinic_slug_key239; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key239" UNIQUE (slug);


--
-- TOC entry 4288 (class 2606 OID 320256)
-- Name: Clinic Clinic_slug_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key24" UNIQUE (slug);


--
-- TOC entry 4290 (class 2606 OID 320258)
-- Name: Clinic Clinic_slug_key240; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key240" UNIQUE (slug);


--
-- TOC entry 4292 (class 2606 OID 320260)
-- Name: Clinic Clinic_slug_key241; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key241" UNIQUE (slug);


--
-- TOC entry 4294 (class 2606 OID 320262)
-- Name: Clinic Clinic_slug_key242; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key242" UNIQUE (slug);


--
-- TOC entry 4296 (class 2606 OID 320264)
-- Name: Clinic Clinic_slug_key243; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key243" UNIQUE (slug);


--
-- TOC entry 4298 (class 2606 OID 319868)
-- Name: Clinic Clinic_slug_key244; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key244" UNIQUE (slug);


--
-- TOC entry 4300 (class 2606 OID 319870)
-- Name: Clinic Clinic_slug_key245; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key245" UNIQUE (slug);


--
-- TOC entry 4302 (class 2606 OID 319872)
-- Name: Clinic Clinic_slug_key246; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key246" UNIQUE (slug);


--
-- TOC entry 4304 (class 2606 OID 319874)
-- Name: Clinic Clinic_slug_key247; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key247" UNIQUE (slug);


--
-- TOC entry 4306 (class 2606 OID 319876)
-- Name: Clinic Clinic_slug_key248; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key248" UNIQUE (slug);


--
-- TOC entry 4308 (class 2606 OID 319878)
-- Name: Clinic Clinic_slug_key249; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key249" UNIQUE (slug);


--
-- TOC entry 4310 (class 2606 OID 319880)
-- Name: Clinic Clinic_slug_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key25" UNIQUE (slug);


--
-- TOC entry 4312 (class 2606 OID 319882)
-- Name: Clinic Clinic_slug_key250; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key250" UNIQUE (slug);


--
-- TOC entry 4314 (class 2606 OID 319884)
-- Name: Clinic Clinic_slug_key251; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key251" UNIQUE (slug);


--
-- TOC entry 4316 (class 2606 OID 319886)
-- Name: Clinic Clinic_slug_key252; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key252" UNIQUE (slug);


--
-- TOC entry 4318 (class 2606 OID 319888)
-- Name: Clinic Clinic_slug_key253; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key253" UNIQUE (slug);


--
-- TOC entry 4320 (class 2606 OID 319890)
-- Name: Clinic Clinic_slug_key254; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key254" UNIQUE (slug);


--
-- TOC entry 4322 (class 2606 OID 319892)
-- Name: Clinic Clinic_slug_key255; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key255" UNIQUE (slug);


--
-- TOC entry 4324 (class 2606 OID 319894)
-- Name: Clinic Clinic_slug_key256; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key256" UNIQUE (slug);


--
-- TOC entry 4326 (class 2606 OID 319774)
-- Name: Clinic Clinic_slug_key257; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key257" UNIQUE (slug);


--
-- TOC entry 4328 (class 2606 OID 319778)
-- Name: Clinic Clinic_slug_key258; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key258" UNIQUE (slug);


--
-- TOC entry 4330 (class 2606 OID 319776)
-- Name: Clinic Clinic_slug_key259; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key259" UNIQUE (slug);


--
-- TOC entry 4332 (class 2606 OID 319896)
-- Name: Clinic Clinic_slug_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key26" UNIQUE (slug);


--
-- TOC entry 4334 (class 2606 OID 320266)
-- Name: Clinic Clinic_slug_key260; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key260" UNIQUE (slug);


--
-- TOC entry 4336 (class 2606 OID 319866)
-- Name: Clinic Clinic_slug_key261; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key261" UNIQUE (slug);


--
-- TOC entry 4338 (class 2606 OID 319864)
-- Name: Clinic Clinic_slug_key262; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key262" UNIQUE (slug);


--
-- TOC entry 4340 (class 2606 OID 319862)
-- Name: Clinic Clinic_slug_key263; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key263" UNIQUE (slug);


--
-- TOC entry 4342 (class 2606 OID 319860)
-- Name: Clinic Clinic_slug_key264; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key264" UNIQUE (slug);


--
-- TOC entry 4344 (class 2606 OID 319858)
-- Name: Clinic Clinic_slug_key265; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key265" UNIQUE (slug);


--
-- TOC entry 4346 (class 2606 OID 319856)
-- Name: Clinic Clinic_slug_key266; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key266" UNIQUE (slug);


--
-- TOC entry 4348 (class 2606 OID 320268)
-- Name: Clinic Clinic_slug_key267; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key267" UNIQUE (slug);


--
-- TOC entry 4350 (class 2606 OID 319738)
-- Name: Clinic Clinic_slug_key268; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key268" UNIQUE (slug);


--
-- TOC entry 4352 (class 2606 OID 319736)
-- Name: Clinic Clinic_slug_key269; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key269" UNIQUE (slug);


--
-- TOC entry 4354 (class 2606 OID 319898)
-- Name: Clinic Clinic_slug_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key27" UNIQUE (slug);


--
-- TOC entry 4356 (class 2606 OID 320270)
-- Name: Clinic Clinic_slug_key270; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key270" UNIQUE (slug);


--
-- TOC entry 4358 (class 2606 OID 320272)
-- Name: Clinic Clinic_slug_key271; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key271" UNIQUE (slug);


--
-- TOC entry 4360 (class 2606 OID 319734)
-- Name: Clinic Clinic_slug_key272; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key272" UNIQUE (slug);


--
-- TOC entry 4362 (class 2606 OID 320274)
-- Name: Clinic Clinic_slug_key273; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key273" UNIQUE (slug);


--
-- TOC entry 4364 (class 2606 OID 320276)
-- Name: Clinic Clinic_slug_key274; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key274" UNIQUE (slug);


--
-- TOC entry 4366 (class 2606 OID 319732)
-- Name: Clinic Clinic_slug_key275; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key275" UNIQUE (slug);


--
-- TOC entry 4368 (class 2606 OID 320278)
-- Name: Clinic Clinic_slug_key276; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key276" UNIQUE (slug);


--
-- TOC entry 4370 (class 2606 OID 320280)
-- Name: Clinic Clinic_slug_key277; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key277" UNIQUE (slug);


--
-- TOC entry 4372 (class 2606 OID 320298)
-- Name: Clinic Clinic_slug_key278; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key278" UNIQUE (slug);


--
-- TOC entry 4374 (class 2606 OID 320296)
-- Name: Clinic Clinic_slug_key279; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key279" UNIQUE (slug);


--
-- TOC entry 4376 (class 2606 OID 319900)
-- Name: Clinic Clinic_slug_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key28" UNIQUE (slug);


--
-- TOC entry 4378 (class 2606 OID 320294)
-- Name: Clinic Clinic_slug_key280; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key280" UNIQUE (slug);


--
-- TOC entry 4380 (class 2606 OID 320292)
-- Name: Clinic Clinic_slug_key281; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key281" UNIQUE (slug);


--
-- TOC entry 4382 (class 2606 OID 320282)
-- Name: Clinic Clinic_slug_key282; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key282" UNIQUE (slug);


--
-- TOC entry 4384 (class 2606 OID 320284)
-- Name: Clinic Clinic_slug_key283; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key283" UNIQUE (slug);


--
-- TOC entry 4386 (class 2606 OID 320290)
-- Name: Clinic Clinic_slug_key284; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key284" UNIQUE (slug);


--
-- TOC entry 4388 (class 2606 OID 320288)
-- Name: Clinic Clinic_slug_key285; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key285" UNIQUE (slug);


--
-- TOC entry 4390 (class 2606 OID 320286)
-- Name: Clinic Clinic_slug_key286; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key286" UNIQUE (slug);


--
-- TOC entry 4392 (class 2606 OID 320234)
-- Name: Clinic Clinic_slug_key287; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key287" UNIQUE (slug);


--
-- TOC entry 4394 (class 2606 OID 320252)
-- Name: Clinic Clinic_slug_key288; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key288" UNIQUE (slug);


--
-- TOC entry 4396 (class 2606 OID 320236)
-- Name: Clinic Clinic_slug_key289; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key289" UNIQUE (slug);


--
-- TOC entry 4398 (class 2606 OID 319902)
-- Name: Clinic Clinic_slug_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key29" UNIQUE (slug);


--
-- TOC entry 4400 (class 2606 OID 320250)
-- Name: Clinic Clinic_slug_key290; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key290" UNIQUE (slug);


--
-- TOC entry 4402 (class 2606 OID 320248)
-- Name: Clinic Clinic_slug_key291; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key291" UNIQUE (slug);


--
-- TOC entry 4404 (class 2606 OID 320246)
-- Name: Clinic Clinic_slug_key292; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key292" UNIQUE (slug);


--
-- TOC entry 4406 (class 2606 OID 320244)
-- Name: Clinic Clinic_slug_key293; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key293" UNIQUE (slug);


--
-- TOC entry 4408 (class 2606 OID 320242)
-- Name: Clinic Clinic_slug_key294; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key294" UNIQUE (slug);


--
-- TOC entry 4410 (class 2606 OID 320240)
-- Name: Clinic Clinic_slug_key295; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key295" UNIQUE (slug);


--
-- TOC entry 4412 (class 2606 OID 320238)
-- Name: Clinic Clinic_slug_key296; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key296" UNIQUE (slug);


--
-- TOC entry 4414 (class 2606 OID 320014)
-- Name: Clinic Clinic_slug_key297; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key297" UNIQUE (slug);


--
-- TOC entry 4416 (class 2606 OID 320220)
-- Name: Clinic Clinic_slug_key298; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key298" UNIQUE (slug);


--
-- TOC entry 4418 (class 2606 OID 320218)
-- Name: Clinic Clinic_slug_key299; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key299" UNIQUE (slug);


--
-- TOC entry 4420 (class 2606 OID 319904)
-- Name: Clinic Clinic_slug_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key3" UNIQUE (slug);


--
-- TOC entry 4422 (class 2606 OID 319906)
-- Name: Clinic Clinic_slug_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key30" UNIQUE (slug);


--
-- TOC entry 4424 (class 2606 OID 320216)
-- Name: Clinic Clinic_slug_key300; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key300" UNIQUE (slug);


--
-- TOC entry 4426 (class 2606 OID 320214)
-- Name: Clinic Clinic_slug_key301; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key301" UNIQUE (slug);


--
-- TOC entry 4428 (class 2606 OID 320212)
-- Name: Clinic Clinic_slug_key302; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key302" UNIQUE (slug);


--
-- TOC entry 4430 (class 2606 OID 319974)
-- Name: Clinic Clinic_slug_key303; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key303" UNIQUE (slug);


--
-- TOC entry 4432 (class 2606 OID 320054)
-- Name: Clinic Clinic_slug_key304; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key304" UNIQUE (slug);


--
-- TOC entry 4434 (class 2606 OID 320052)
-- Name: Clinic Clinic_slug_key305; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key305" UNIQUE (slug);


--
-- TOC entry 4436 (class 2606 OID 319976)
-- Name: Clinic Clinic_slug_key306; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key306" UNIQUE (slug);


--
-- TOC entry 4438 (class 2606 OID 320012)
-- Name: Clinic Clinic_slug_key307; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key307" UNIQUE (slug);


--
-- TOC entry 4440 (class 2606 OID 320010)
-- Name: Clinic Clinic_slug_key308; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key308" UNIQUE (slug);


--
-- TOC entry 4442 (class 2606 OID 319978)
-- Name: Clinic Clinic_slug_key309; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key309" UNIQUE (slug);


--
-- TOC entry 4444 (class 2606 OID 319908)
-- Name: Clinic Clinic_slug_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key31" UNIQUE (slug);


--
-- TOC entry 4446 (class 2606 OID 319980)
-- Name: Clinic Clinic_slug_key310; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key310" UNIQUE (slug);


--
-- TOC entry 4448 (class 2606 OID 320008)
-- Name: Clinic Clinic_slug_key311; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key311" UNIQUE (slug);


--
-- TOC entry 4450 (class 2606 OID 319982)
-- Name: Clinic Clinic_slug_key312; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key312" UNIQUE (slug);


--
-- TOC entry 4452 (class 2606 OID 319984)
-- Name: Clinic Clinic_slug_key313; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key313" UNIQUE (slug);


--
-- TOC entry 4454 (class 2606 OID 320006)
-- Name: Clinic Clinic_slug_key314; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key314" UNIQUE (slug);


--
-- TOC entry 4456 (class 2606 OID 320004)
-- Name: Clinic Clinic_slug_key315; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key315" UNIQUE (slug);


--
-- TOC entry 4458 (class 2606 OID 320002)
-- Name: Clinic Clinic_slug_key316; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key316" UNIQUE (slug);


--
-- TOC entry 4460 (class 2606 OID 320000)
-- Name: Clinic Clinic_slug_key317; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key317" UNIQUE (slug);


--
-- TOC entry 4462 (class 2606 OID 319998)
-- Name: Clinic Clinic_slug_key318; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key318" UNIQUE (slug);


--
-- TOC entry 4464 (class 2606 OID 319996)
-- Name: Clinic Clinic_slug_key319; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key319" UNIQUE (slug);


--
-- TOC entry 4466 (class 2606 OID 319910)
-- Name: Clinic Clinic_slug_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key32" UNIQUE (slug);


--
-- TOC entry 4468 (class 2606 OID 319986)
-- Name: Clinic Clinic_slug_key320; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key320" UNIQUE (slug);


--
-- TOC entry 4470 (class 2606 OID 319994)
-- Name: Clinic Clinic_slug_key321; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key321" UNIQUE (slug);


--
-- TOC entry 4472 (class 2606 OID 319992)
-- Name: Clinic Clinic_slug_key322; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key322" UNIQUE (slug);


--
-- TOC entry 4474 (class 2606 OID 319990)
-- Name: Clinic Clinic_slug_key323; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key323" UNIQUE (slug);


--
-- TOC entry 4476 (class 2606 OID 319988)
-- Name: Clinic Clinic_slug_key324; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key324" UNIQUE (slug);


--
-- TOC entry 4478 (class 2606 OID 320316)
-- Name: Clinic Clinic_slug_key325; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key325" UNIQUE (slug);


--
-- TOC entry 4480 (class 2606 OID 319846)
-- Name: Clinic Clinic_slug_key326; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key326" UNIQUE (slug);


--
-- TOC entry 4482 (class 2606 OID 319844)
-- Name: Clinic Clinic_slug_key327; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key327" UNIQUE (slug);


--
-- TOC entry 4484 (class 2606 OID 319842)
-- Name: Clinic Clinic_slug_key328; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key328" UNIQUE (slug);


--
-- TOC entry 4486 (class 2606 OID 319840)
-- Name: Clinic Clinic_slug_key329; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key329" UNIQUE (slug);


--
-- TOC entry 4488 (class 2606 OID 319912)
-- Name: Clinic Clinic_slug_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key33" UNIQUE (slug);


--
-- TOC entry 4490 (class 2606 OID 319838)
-- Name: Clinic Clinic_slug_key330; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key330" UNIQUE (slug);


--
-- TOC entry 4492 (class 2606 OID 320318)
-- Name: Clinic Clinic_slug_key331; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key331" UNIQUE (slug);


--
-- TOC entry 4494 (class 2606 OID 319654)
-- Name: Clinic Clinic_slug_key332; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key332" UNIQUE (slug);


--
-- TOC entry 4496 (class 2606 OID 320320)
-- Name: Clinic Clinic_slug_key333; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key333" UNIQUE (slug);


--
-- TOC entry 4498 (class 2606 OID 319652)
-- Name: Clinic Clinic_slug_key334; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key334" UNIQUE (slug);


--
-- TOC entry 4500 (class 2606 OID 319650)
-- Name: Clinic Clinic_slug_key335; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key335" UNIQUE (slug);


--
-- TOC entry 4502 (class 2606 OID 320322)
-- Name: Clinic Clinic_slug_key336; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key336" UNIQUE (slug);


--
-- TOC entry 4504 (class 2606 OID 319648)
-- Name: Clinic Clinic_slug_key337; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key337" UNIQUE (slug);


--
-- TOC entry 4506 (class 2606 OID 320324)
-- Name: Clinic Clinic_slug_key338; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key338" UNIQUE (slug);


--
-- TOC entry 4508 (class 2606 OID 319646)
-- Name: Clinic Clinic_slug_key339; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key339" UNIQUE (slug);


--
-- TOC entry 4510 (class 2606 OID 319914)
-- Name: Clinic Clinic_slug_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key34" UNIQUE (slug);


--
-- TOC entry 4512 (class 2606 OID 319644)
-- Name: Clinic Clinic_slug_key340; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key340" UNIQUE (slug);


--
-- TOC entry 4514 (class 2606 OID 319642)
-- Name: Clinic Clinic_slug_key341; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key341" UNIQUE (slug);


--
-- TOC entry 4516 (class 2606 OID 319640)
-- Name: Clinic Clinic_slug_key342; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key342" UNIQUE (slug);


--
-- TOC entry 4518 (class 2606 OID 320326)
-- Name: Clinic Clinic_slug_key343; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key343" UNIQUE (slug);


--
-- TOC entry 4520 (class 2606 OID 319638)
-- Name: Clinic Clinic_slug_key344; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key344" UNIQUE (slug);


--
-- TOC entry 4522 (class 2606 OID 319636)
-- Name: Clinic Clinic_slug_key345; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key345" UNIQUE (slug);


--
-- TOC entry 4524 (class 2606 OID 320328)
-- Name: Clinic Clinic_slug_key346; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key346" UNIQUE (slug);


--
-- TOC entry 4526 (class 2606 OID 319634)
-- Name: Clinic Clinic_slug_key347; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key347" UNIQUE (slug);


--
-- TOC entry 4528 (class 2606 OID 319632)
-- Name: Clinic Clinic_slug_key348; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key348" UNIQUE (slug);


--
-- TOC entry 4530 (class 2606 OID 319630)
-- Name: Clinic Clinic_slug_key349; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key349" UNIQUE (slug);


--
-- TOC entry 4532 (class 2606 OID 319916)
-- Name: Clinic Clinic_slug_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key35" UNIQUE (slug);


--
-- TOC entry 4534 (class 2606 OID 319628)
-- Name: Clinic Clinic_slug_key350; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key350" UNIQUE (slug);


--
-- TOC entry 4536 (class 2606 OID 320330)
-- Name: Clinic Clinic_slug_key351; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key351" UNIQUE (slug);


--
-- TOC entry 4538 (class 2606 OID 319626)
-- Name: Clinic Clinic_slug_key352; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key352" UNIQUE (slug);


--
-- TOC entry 4540 (class 2606 OID 319918)
-- Name: Clinic Clinic_slug_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key36" UNIQUE (slug);


--
-- TOC entry 4542 (class 2606 OID 319920)
-- Name: Clinic Clinic_slug_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key37" UNIQUE (slug);


--
-- TOC entry 4544 (class 2606 OID 319922)
-- Name: Clinic Clinic_slug_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key38" UNIQUE (slug);


--
-- TOC entry 4546 (class 2606 OID 319656)
-- Name: Clinic Clinic_slug_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key39" UNIQUE (slug);


--
-- TOC entry 4548 (class 2606 OID 319658)
-- Name: Clinic Clinic_slug_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key4" UNIQUE (slug);


--
-- TOC entry 4550 (class 2606 OID 319660)
-- Name: Clinic Clinic_slug_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key40" UNIQUE (slug);


--
-- TOC entry 4552 (class 2606 OID 319662)
-- Name: Clinic Clinic_slug_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key41" UNIQUE (slug);


--
-- TOC entry 4554 (class 2606 OID 319664)
-- Name: Clinic Clinic_slug_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key42" UNIQUE (slug);


--
-- TOC entry 4556 (class 2606 OID 319666)
-- Name: Clinic Clinic_slug_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key43" UNIQUE (slug);


--
-- TOC entry 4558 (class 2606 OID 319668)
-- Name: Clinic Clinic_slug_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key44" UNIQUE (slug);


--
-- TOC entry 4560 (class 2606 OID 319670)
-- Name: Clinic Clinic_slug_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key45" UNIQUE (slug);


--
-- TOC entry 4562 (class 2606 OID 319672)
-- Name: Clinic Clinic_slug_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key46" UNIQUE (slug);


--
-- TOC entry 4564 (class 2606 OID 319740)
-- Name: Clinic Clinic_slug_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key47" UNIQUE (slug);


--
-- TOC entry 4566 (class 2606 OID 319742)
-- Name: Clinic Clinic_slug_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key48" UNIQUE (slug);


--
-- TOC entry 4568 (class 2606 OID 320300)
-- Name: Clinic Clinic_slug_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key49" UNIQUE (slug);


--
-- TOC entry 4570 (class 2606 OID 320302)
-- Name: Clinic Clinic_slug_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key5" UNIQUE (slug);


--
-- TOC entry 4572 (class 2606 OID 320304)
-- Name: Clinic Clinic_slug_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key50" UNIQUE (slug);


--
-- TOC entry 4574 (class 2606 OID 320306)
-- Name: Clinic Clinic_slug_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key51" UNIQUE (slug);


--
-- TOC entry 4576 (class 2606 OID 320308)
-- Name: Clinic Clinic_slug_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key52" UNIQUE (slug);


--
-- TOC entry 4578 (class 2606 OID 320310)
-- Name: Clinic Clinic_slug_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key53" UNIQUE (slug);


--
-- TOC entry 4580 (class 2606 OID 320312)
-- Name: Clinic Clinic_slug_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key54" UNIQUE (slug);


--
-- TOC entry 4582 (class 2606 OID 320314)
-- Name: Clinic Clinic_slug_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key55" UNIQUE (slug);


--
-- TOC entry 4584 (class 2606 OID 319848)
-- Name: Clinic Clinic_slug_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key56" UNIQUE (slug);


--
-- TOC entry 4586 (class 2606 OID 319850)
-- Name: Clinic Clinic_slug_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key57" UNIQUE (slug);


--
-- TOC entry 4588 (class 2606 OID 319852)
-- Name: Clinic Clinic_slug_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key58" UNIQUE (slug);


--
-- TOC entry 4590 (class 2606 OID 319854)
-- Name: Clinic Clinic_slug_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key59" UNIQUE (slug);


--
-- TOC entry 4592 (class 2606 OID 319674)
-- Name: Clinic Clinic_slug_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key6" UNIQUE (slug);


--
-- TOC entry 4594 (class 2606 OID 319676)
-- Name: Clinic Clinic_slug_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key60" UNIQUE (slug);


--
-- TOC entry 4596 (class 2606 OID 319678)
-- Name: Clinic Clinic_slug_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key61" UNIQUE (slug);


--
-- TOC entry 4598 (class 2606 OID 319680)
-- Name: Clinic Clinic_slug_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key62" UNIQUE (slug);


--
-- TOC entry 4600 (class 2606 OID 319682)
-- Name: Clinic Clinic_slug_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key63" UNIQUE (slug);


--
-- TOC entry 4602 (class 2606 OID 319684)
-- Name: Clinic Clinic_slug_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key64" UNIQUE (slug);


--
-- TOC entry 4604 (class 2606 OID 319686)
-- Name: Clinic Clinic_slug_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key65" UNIQUE (slug);


--
-- TOC entry 4606 (class 2606 OID 319688)
-- Name: Clinic Clinic_slug_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key66" UNIQUE (slug);


--
-- TOC entry 4608 (class 2606 OID 319690)
-- Name: Clinic Clinic_slug_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key67" UNIQUE (slug);


--
-- TOC entry 4610 (class 2606 OID 319692)
-- Name: Clinic Clinic_slug_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key68" UNIQUE (slug);


--
-- TOC entry 4612 (class 2606 OID 319694)
-- Name: Clinic Clinic_slug_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key69" UNIQUE (slug);


--
-- TOC entry 4614 (class 2606 OID 319696)
-- Name: Clinic Clinic_slug_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key7" UNIQUE (slug);


--
-- TOC entry 4616 (class 2606 OID 319698)
-- Name: Clinic Clinic_slug_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key70" UNIQUE (slug);


--
-- TOC entry 4618 (class 2606 OID 319700)
-- Name: Clinic Clinic_slug_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key71" UNIQUE (slug);


--
-- TOC entry 4620 (class 2606 OID 319702)
-- Name: Clinic Clinic_slug_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key72" UNIQUE (slug);


--
-- TOC entry 4622 (class 2606 OID 319704)
-- Name: Clinic Clinic_slug_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key73" UNIQUE (slug);


--
-- TOC entry 4624 (class 2606 OID 319706)
-- Name: Clinic Clinic_slug_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key74" UNIQUE (slug);


--
-- TOC entry 4626 (class 2606 OID 319708)
-- Name: Clinic Clinic_slug_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key75" UNIQUE (slug);


--
-- TOC entry 4628 (class 2606 OID 319710)
-- Name: Clinic Clinic_slug_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key76" UNIQUE (slug);


--
-- TOC entry 4630 (class 2606 OID 319712)
-- Name: Clinic Clinic_slug_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key77" UNIQUE (slug);


--
-- TOC entry 4632 (class 2606 OID 319714)
-- Name: Clinic Clinic_slug_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key78" UNIQUE (slug);


--
-- TOC entry 4634 (class 2606 OID 319716)
-- Name: Clinic Clinic_slug_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key79" UNIQUE (slug);


--
-- TOC entry 4636 (class 2606 OID 319718)
-- Name: Clinic Clinic_slug_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key8" UNIQUE (slug);


--
-- TOC entry 4638 (class 2606 OID 319720)
-- Name: Clinic Clinic_slug_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key80" UNIQUE (slug);


--
-- TOC entry 4640 (class 2606 OID 319722)
-- Name: Clinic Clinic_slug_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key81" UNIQUE (slug);


--
-- TOC entry 4642 (class 2606 OID 319724)
-- Name: Clinic Clinic_slug_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key82" UNIQUE (slug);


--
-- TOC entry 4644 (class 2606 OID 319726)
-- Name: Clinic Clinic_slug_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key83" UNIQUE (slug);


--
-- TOC entry 4646 (class 2606 OID 319728)
-- Name: Clinic Clinic_slug_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key84" UNIQUE (slug);


--
-- TOC entry 4648 (class 2606 OID 319730)
-- Name: Clinic Clinic_slug_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key85" UNIQUE (slug);


--
-- TOC entry 4650 (class 2606 OID 319744)
-- Name: Clinic Clinic_slug_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key86" UNIQUE (slug);


--
-- TOC entry 4652 (class 2606 OID 319746)
-- Name: Clinic Clinic_slug_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key87" UNIQUE (slug);


--
-- TOC entry 4654 (class 2606 OID 319748)
-- Name: Clinic Clinic_slug_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key88" UNIQUE (slug);


--
-- TOC entry 4656 (class 2606 OID 319750)
-- Name: Clinic Clinic_slug_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key89" UNIQUE (slug);


--
-- TOC entry 4658 (class 2606 OID 319752)
-- Name: Clinic Clinic_slug_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key9" UNIQUE (slug);


--
-- TOC entry 4660 (class 2606 OID 319754)
-- Name: Clinic Clinic_slug_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key90" UNIQUE (slug);


--
-- TOC entry 4662 (class 2606 OID 319756)
-- Name: Clinic Clinic_slug_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key91" UNIQUE (slug);


--
-- TOC entry 4664 (class 2606 OID 319758)
-- Name: Clinic Clinic_slug_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key92" UNIQUE (slug);


--
-- TOC entry 4666 (class 2606 OID 319760)
-- Name: Clinic Clinic_slug_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key93" UNIQUE (slug);


--
-- TOC entry 4668 (class 2606 OID 319762)
-- Name: Clinic Clinic_slug_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key94" UNIQUE (slug);


--
-- TOC entry 4670 (class 2606 OID 319764)
-- Name: Clinic Clinic_slug_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key95" UNIQUE (slug);


--
-- TOC entry 4672 (class 2606 OID 319766)
-- Name: Clinic Clinic_slug_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key96" UNIQUE (slug);


--
-- TOC entry 4674 (class 2606 OID 319768)
-- Name: Clinic Clinic_slug_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key97" UNIQUE (slug);


--
-- TOC entry 4676 (class 2606 OID 319770)
-- Name: Clinic Clinic_slug_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key98" UNIQUE (slug);


--
-- TOC entry 4678 (class 2606 OID 319772)
-- Name: Clinic Clinic_slug_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key99" UNIQUE (slug);


--
-- TOC entry 4680 (class 2606 OID 51620)
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- TOC entry 4682 (class 2606 OID 51622)
-- Name: FormSectionTemplate FormSectionTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."FormSectionTemplate"
    ADD CONSTRAINT "FormSectionTemplate_pkey" PRIMARY KEY (id);


--
-- TOC entry 5094 (class 2606 OID 51624)
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 4684 (class 2606 OID 321885)
-- Name: Order Order_orderNumber_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key" UNIQUE ("orderNumber");


--
-- TOC entry 4686 (class 2606 OID 321887)
-- Name: Order Order_orderNumber_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key1" UNIQUE ("orderNumber");


--
-- TOC entry 4688 (class 2606 OID 321889)
-- Name: Order Order_orderNumber_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key10" UNIQUE ("orderNumber");


--
-- TOC entry 4690 (class 2606 OID 321891)
-- Name: Order Order_orderNumber_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key100" UNIQUE ("orderNumber");


--
-- TOC entry 4692 (class 2606 OID 321893)
-- Name: Order Order_orderNumber_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key101" UNIQUE ("orderNumber");


--
-- TOC entry 4694 (class 2606 OID 321895)
-- Name: Order Order_orderNumber_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key102" UNIQUE ("orderNumber");


--
-- TOC entry 4696 (class 2606 OID 321897)
-- Name: Order Order_orderNumber_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key103" UNIQUE ("orderNumber");


--
-- TOC entry 4698 (class 2606 OID 321899)
-- Name: Order Order_orderNumber_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key104" UNIQUE ("orderNumber");


--
-- TOC entry 4700 (class 2606 OID 321903)
-- Name: Order Order_orderNumber_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key105" UNIQUE ("orderNumber");


--
-- TOC entry 4702 (class 2606 OID 321905)
-- Name: Order Order_orderNumber_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key106" UNIQUE ("orderNumber");


--
-- TOC entry 4704 (class 2606 OID 321907)
-- Name: Order Order_orderNumber_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key107" UNIQUE ("orderNumber");


--
-- TOC entry 4706 (class 2606 OID 321909)
-- Name: Order Order_orderNumber_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key108" UNIQUE ("orderNumber");


--
-- TOC entry 4708 (class 2606 OID 321913)
-- Name: Order Order_orderNumber_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key109" UNIQUE ("orderNumber");


--
-- TOC entry 4710 (class 2606 OID 321915)
-- Name: Order Order_orderNumber_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key11" UNIQUE ("orderNumber");


--
-- TOC entry 4712 (class 2606 OID 321917)
-- Name: Order Order_orderNumber_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key110" UNIQUE ("orderNumber");


--
-- TOC entry 4714 (class 2606 OID 321919)
-- Name: Order Order_orderNumber_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key111" UNIQUE ("orderNumber");


--
-- TOC entry 4716 (class 2606 OID 321921)
-- Name: Order Order_orderNumber_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key112" UNIQUE ("orderNumber");


--
-- TOC entry 4718 (class 2606 OID 321923)
-- Name: Order Order_orderNumber_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key113" UNIQUE ("orderNumber");


--
-- TOC entry 4720 (class 2606 OID 321925)
-- Name: Order Order_orderNumber_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key114" UNIQUE ("orderNumber");


--
-- TOC entry 4722 (class 2606 OID 321721)
-- Name: Order Order_orderNumber_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key115" UNIQUE ("orderNumber");


--
-- TOC entry 4724 (class 2606 OID 321883)
-- Name: Order Order_orderNumber_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key116" UNIQUE ("orderNumber");


--
-- TOC entry 4726 (class 2606 OID 321723)
-- Name: Order Order_orderNumber_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key117" UNIQUE ("orderNumber");


--
-- TOC entry 4728 (class 2606 OID 321725)
-- Name: Order Order_orderNumber_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key118" UNIQUE ("orderNumber");


--
-- TOC entry 4730 (class 2606 OID 321881)
-- Name: Order Order_orderNumber_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key119" UNIQUE ("orderNumber");


--
-- TOC entry 4732 (class 2606 OID 321927)
-- Name: Order Order_orderNumber_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key12" UNIQUE ("orderNumber");


--
-- TOC entry 4734 (class 2606 OID 321727)
-- Name: Order Order_orderNumber_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key120" UNIQUE ("orderNumber");


--
-- TOC entry 4736 (class 2606 OID 321879)
-- Name: Order Order_orderNumber_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key121" UNIQUE ("orderNumber");


--
-- TOC entry 4738 (class 2606 OID 321729)
-- Name: Order Order_orderNumber_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key122" UNIQUE ("orderNumber");


--
-- TOC entry 4740 (class 2606 OID 321877)
-- Name: Order Order_orderNumber_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key123" UNIQUE ("orderNumber");


--
-- TOC entry 4742 (class 2606 OID 321731)
-- Name: Order Order_orderNumber_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key124" UNIQUE ("orderNumber");


--
-- TOC entry 4744 (class 2606 OID 321733)
-- Name: Order Order_orderNumber_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key125" UNIQUE ("orderNumber");


--
-- TOC entry 4746 (class 2606 OID 321875)
-- Name: Order Order_orderNumber_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key126" UNIQUE ("orderNumber");


--
-- TOC entry 4748 (class 2606 OID 321735)
-- Name: Order Order_orderNumber_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key127" UNIQUE ("orderNumber");


--
-- TOC entry 4750 (class 2606 OID 321873)
-- Name: Order Order_orderNumber_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key128" UNIQUE ("orderNumber");


--
-- TOC entry 4752 (class 2606 OID 321737)
-- Name: Order Order_orderNumber_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key129" UNIQUE ("orderNumber");


--
-- TOC entry 4754 (class 2606 OID 321929)
-- Name: Order Order_orderNumber_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key13" UNIQUE ("orderNumber");


--
-- TOC entry 4756 (class 2606 OID 321871)
-- Name: Order Order_orderNumber_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key130" UNIQUE ("orderNumber");


--
-- TOC entry 4758 (class 2606 OID 321739)
-- Name: Order Order_orderNumber_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key131" UNIQUE ("orderNumber");


--
-- TOC entry 4760 (class 2606 OID 321869)
-- Name: Order Order_orderNumber_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key132" UNIQUE ("orderNumber");


--
-- TOC entry 4762 (class 2606 OID 321741)
-- Name: Order Order_orderNumber_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key133" UNIQUE ("orderNumber");


--
-- TOC entry 4764 (class 2606 OID 321743)
-- Name: Order Order_orderNumber_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key134" UNIQUE ("orderNumber");


--
-- TOC entry 4766 (class 2606 OID 321745)
-- Name: Order Order_orderNumber_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key135" UNIQUE ("orderNumber");


--
-- TOC entry 4768 (class 2606 OID 321867)
-- Name: Order Order_orderNumber_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key136" UNIQUE ("orderNumber");


--
-- TOC entry 4770 (class 2606 OID 321747)
-- Name: Order Order_orderNumber_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key137" UNIQUE ("orderNumber");


--
-- TOC entry 4772 (class 2606 OID 321749)
-- Name: Order Order_orderNumber_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key138" UNIQUE ("orderNumber");


--
-- TOC entry 4774 (class 2606 OID 321751)
-- Name: Order Order_orderNumber_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key139" UNIQUE ("orderNumber");


--
-- TOC entry 4776 (class 2606 OID 321933)
-- Name: Order Order_orderNumber_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key14" UNIQUE ("orderNumber");


--
-- TOC entry 4778 (class 2606 OID 321865)
-- Name: Order Order_orderNumber_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key140" UNIQUE ("orderNumber");


--
-- TOC entry 4780 (class 2606 OID 321863)
-- Name: Order Order_orderNumber_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key141" UNIQUE ("orderNumber");


--
-- TOC entry 4782 (class 2606 OID 321901)
-- Name: Order Order_orderNumber_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key142" UNIQUE ("orderNumber");


--
-- TOC entry 4784 (class 2606 OID 321861)
-- Name: Order Order_orderNumber_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key143" UNIQUE ("orderNumber");


--
-- TOC entry 4786 (class 2606 OID 321931)
-- Name: Order Order_orderNumber_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key144" UNIQUE ("orderNumber");


--
-- TOC entry 4788 (class 2606 OID 321859)
-- Name: Order Order_orderNumber_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key145" UNIQUE ("orderNumber");


--
-- TOC entry 4790 (class 2606 OID 321911)
-- Name: Order Order_orderNumber_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key146" UNIQUE ("orderNumber");


--
-- TOC entry 4792 (class 2606 OID 321753)
-- Name: Order Order_orderNumber_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key147" UNIQUE ("orderNumber");


--
-- TOC entry 4794 (class 2606 OID 321857)
-- Name: Order Order_orderNumber_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key148" UNIQUE ("orderNumber");


--
-- TOC entry 4796 (class 2606 OID 321755)
-- Name: Order Order_orderNumber_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key149" UNIQUE ("orderNumber");


--
-- TOC entry 4798 (class 2606 OID 321935)
-- Name: Order Order_orderNumber_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key15" UNIQUE ("orderNumber");


--
-- TOC entry 4800 (class 2606 OID 321855)
-- Name: Order Order_orderNumber_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key150" UNIQUE ("orderNumber");


--
-- TOC entry 4802 (class 2606 OID 321763)
-- Name: Order Order_orderNumber_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key151" UNIQUE ("orderNumber");


--
-- TOC entry 4804 (class 2606 OID 321853)
-- Name: Order Order_orderNumber_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key152" UNIQUE ("orderNumber");


--
-- TOC entry 4806 (class 2606 OID 321765)
-- Name: Order Order_orderNumber_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key153" UNIQUE ("orderNumber");


--
-- TOC entry 4808 (class 2606 OID 321767)
-- Name: Order Order_orderNumber_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key154" UNIQUE ("orderNumber");


--
-- TOC entry 4810 (class 2606 OID 321851)
-- Name: Order Order_orderNumber_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key155" UNIQUE ("orderNumber");


--
-- TOC entry 4812 (class 2606 OID 321769)
-- Name: Order Order_orderNumber_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key156" UNIQUE ("orderNumber");


--
-- TOC entry 4814 (class 2606 OID 321771)
-- Name: Order Order_orderNumber_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key157" UNIQUE ("orderNumber");


--
-- TOC entry 4816 (class 2606 OID 321849)
-- Name: Order Order_orderNumber_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key158" UNIQUE ("orderNumber");


--
-- TOC entry 4818 (class 2606 OID 321773)
-- Name: Order Order_orderNumber_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key159" UNIQUE ("orderNumber");


--
-- TOC entry 4820 (class 2606 OID 321937)
-- Name: Order Order_orderNumber_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key16" UNIQUE ("orderNumber");


--
-- TOC entry 4822 (class 2606 OID 321775)
-- Name: Order Order_orderNumber_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key160" UNIQUE ("orderNumber");


--
-- TOC entry 4824 (class 2606 OID 321777)
-- Name: Order Order_orderNumber_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key161" UNIQUE ("orderNumber");


--
-- TOC entry 4826 (class 2606 OID 321847)
-- Name: Order Order_orderNumber_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key162" UNIQUE ("orderNumber");


--
-- TOC entry 4828 (class 2606 OID 321779)
-- Name: Order Order_orderNumber_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key163" UNIQUE ("orderNumber");


--
-- TOC entry 4830 (class 2606 OID 321781)
-- Name: Order Order_orderNumber_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key164" UNIQUE ("orderNumber");


--
-- TOC entry 4832 (class 2606 OID 321845)
-- Name: Order Order_orderNumber_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key165" UNIQUE ("orderNumber");


--
-- TOC entry 4834 (class 2606 OID 321783)
-- Name: Order Order_orderNumber_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key166" UNIQUE ("orderNumber");


--
-- TOC entry 4836 (class 2606 OID 321843)
-- Name: Order Order_orderNumber_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key167" UNIQUE ("orderNumber");


--
-- TOC entry 4838 (class 2606 OID 321785)
-- Name: Order Order_orderNumber_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key168" UNIQUE ("orderNumber");


--
-- TOC entry 4840 (class 2606 OID 321841)
-- Name: Order Order_orderNumber_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key169" UNIQUE ("orderNumber");


--
-- TOC entry 4842 (class 2606 OID 321939)
-- Name: Order Order_orderNumber_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key17" UNIQUE ("orderNumber");


--
-- TOC entry 4844 (class 2606 OID 321787)
-- Name: Order Order_orderNumber_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key170" UNIQUE ("orderNumber");


--
-- TOC entry 4846 (class 2606 OID 321789)
-- Name: Order Order_orderNumber_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key171" UNIQUE ("orderNumber");


--
-- TOC entry 4848 (class 2606 OID 321839)
-- Name: Order Order_orderNumber_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key172" UNIQUE ("orderNumber");


--
-- TOC entry 4850 (class 2606 OID 321791)
-- Name: Order Order_orderNumber_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key173" UNIQUE ("orderNumber");


--
-- TOC entry 4852 (class 2606 OID 321837)
-- Name: Order Order_orderNumber_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key174" UNIQUE ("orderNumber");


--
-- TOC entry 4854 (class 2606 OID 321793)
-- Name: Order Order_orderNumber_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key175" UNIQUE ("orderNumber");


--
-- TOC entry 4856 (class 2606 OID 321795)
-- Name: Order Order_orderNumber_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key176" UNIQUE ("orderNumber");


--
-- TOC entry 4858 (class 2606 OID 321835)
-- Name: Order Order_orderNumber_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key177" UNIQUE ("orderNumber");


--
-- TOC entry 4860 (class 2606 OID 321797)
-- Name: Order Order_orderNumber_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key178" UNIQUE ("orderNumber");


--
-- TOC entry 4862 (class 2606 OID 321833)
-- Name: Order Order_orderNumber_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key179" UNIQUE ("orderNumber");


--
-- TOC entry 4864 (class 2606 OID 321941)
-- Name: Order Order_orderNumber_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key18" UNIQUE ("orderNumber");


--
-- TOC entry 4866 (class 2606 OID 321799)
-- Name: Order Order_orderNumber_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key180" UNIQUE ("orderNumber");


--
-- TOC entry 4868 (class 2606 OID 321831)
-- Name: Order Order_orderNumber_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key181" UNIQUE ("orderNumber");


--
-- TOC entry 4870 (class 2606 OID 321801)
-- Name: Order Order_orderNumber_key182; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key182" UNIQUE ("orderNumber");


--
-- TOC entry 4872 (class 2606 OID 321829)
-- Name: Order Order_orderNumber_key183; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key183" UNIQUE ("orderNumber");


--
-- TOC entry 4874 (class 2606 OID 321803)
-- Name: Order Order_orderNumber_key184; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key184" UNIQUE ("orderNumber");


--
-- TOC entry 4876 (class 2606 OID 321827)
-- Name: Order Order_orderNumber_key185; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key185" UNIQUE ("orderNumber");


--
-- TOC entry 4878 (class 2606 OID 321805)
-- Name: Order Order_orderNumber_key186; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key186" UNIQUE ("orderNumber");


--
-- TOC entry 4880 (class 2606 OID 321807)
-- Name: Order Order_orderNumber_key187; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key187" UNIQUE ("orderNumber");


--
-- TOC entry 4882 (class 2606 OID 321825)
-- Name: Order Order_orderNumber_key188; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key188" UNIQUE ("orderNumber");


--
-- TOC entry 4884 (class 2606 OID 321809)
-- Name: Order Order_orderNumber_key189; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key189" UNIQUE ("orderNumber");


--
-- TOC entry 4886 (class 2606 OID 321943)
-- Name: Order Order_orderNumber_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key19" UNIQUE ("orderNumber");


--
-- TOC entry 4888 (class 2606 OID 321823)
-- Name: Order Order_orderNumber_key190; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key190" UNIQUE ("orderNumber");


--
-- TOC entry 4890 (class 2606 OID 321811)
-- Name: Order Order_orderNumber_key191; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key191" UNIQUE ("orderNumber");


--
-- TOC entry 4892 (class 2606 OID 321821)
-- Name: Order Order_orderNumber_key192; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key192" UNIQUE ("orderNumber");


--
-- TOC entry 4894 (class 2606 OID 321813)
-- Name: Order Order_orderNumber_key193; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key193" UNIQUE ("orderNumber");


--
-- TOC entry 4896 (class 2606 OID 321815)
-- Name: Order Order_orderNumber_key194; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key194" UNIQUE ("orderNumber");


--
-- TOC entry 4898 (class 2606 OID 321819)
-- Name: Order Order_orderNumber_key195; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key195" UNIQUE ("orderNumber");


--
-- TOC entry 4900 (class 2606 OID 321817)
-- Name: Order Order_orderNumber_key196; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key196" UNIQUE ("orderNumber");


--
-- TOC entry 4902 (class 2606 OID 321757)
-- Name: Order Order_orderNumber_key197; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key197" UNIQUE ("orderNumber");


--
-- TOC entry 4904 (class 2606 OID 321761)
-- Name: Order Order_orderNumber_key198; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key198" UNIQUE ("orderNumber");


--
-- TOC entry 4906 (class 2606 OID 321759)
-- Name: Order Order_orderNumber_key199; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key199" UNIQUE ("orderNumber");


--
-- TOC entry 4908 (class 2606 OID 321945)
-- Name: Order Order_orderNumber_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key2" UNIQUE ("orderNumber");


--
-- TOC entry 4910 (class 2606 OID 321947)
-- Name: Order Order_orderNumber_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key20" UNIQUE ("orderNumber");


--
-- TOC entry 4912 (class 2606 OID 321697)
-- Name: Order Order_orderNumber_key200; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key200" UNIQUE ("orderNumber");


--
-- TOC entry 4914 (class 2606 OID 322099)
-- Name: Order Order_orderNumber_key201; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key201" UNIQUE ("orderNumber");


--
-- TOC entry 4916 (class 2606 OID 322101)
-- Name: Order Order_orderNumber_key202; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key202" UNIQUE ("orderNumber");


--
-- TOC entry 4918 (class 2606 OID 321695)
-- Name: Order Order_orderNumber_key203; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key203" UNIQUE ("orderNumber");


--
-- TOC entry 4920 (class 2606 OID 321949)
-- Name: Order Order_orderNumber_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key21" UNIQUE ("orderNumber");


--
-- TOC entry 4922 (class 2606 OID 321951)
-- Name: Order Order_orderNumber_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key22" UNIQUE ("orderNumber");


--
-- TOC entry 4924 (class 2606 OID 321953)
-- Name: Order Order_orderNumber_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key23" UNIQUE ("orderNumber");


--
-- TOC entry 4926 (class 2606 OID 321955)
-- Name: Order Order_orderNumber_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key24" UNIQUE ("orderNumber");


--
-- TOC entry 4928 (class 2606 OID 321957)
-- Name: Order Order_orderNumber_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key25" UNIQUE ("orderNumber");


--
-- TOC entry 4930 (class 2606 OID 321959)
-- Name: Order Order_orderNumber_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key26" UNIQUE ("orderNumber");


--
-- TOC entry 4932 (class 2606 OID 321961)
-- Name: Order Order_orderNumber_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key27" UNIQUE ("orderNumber");


--
-- TOC entry 4934 (class 2606 OID 321963)
-- Name: Order Order_orderNumber_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key28" UNIQUE ("orderNumber");


--
-- TOC entry 4936 (class 2606 OID 321965)
-- Name: Order Order_orderNumber_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key29" UNIQUE ("orderNumber");


--
-- TOC entry 4938 (class 2606 OID 321967)
-- Name: Order Order_orderNumber_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key3" UNIQUE ("orderNumber");


--
-- TOC entry 4940 (class 2606 OID 321969)
-- Name: Order Order_orderNumber_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key30" UNIQUE ("orderNumber");


--
-- TOC entry 4942 (class 2606 OID 321971)
-- Name: Order Order_orderNumber_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key31" UNIQUE ("orderNumber");


--
-- TOC entry 4944 (class 2606 OID 321973)
-- Name: Order Order_orderNumber_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key32" UNIQUE ("orderNumber");


--
-- TOC entry 4946 (class 2606 OID 321975)
-- Name: Order Order_orderNumber_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key33" UNIQUE ("orderNumber");


--
-- TOC entry 4948 (class 2606 OID 321977)
-- Name: Order Order_orderNumber_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key34" UNIQUE ("orderNumber");


--
-- TOC entry 4950 (class 2606 OID 321979)
-- Name: Order Order_orderNumber_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key35" UNIQUE ("orderNumber");


--
-- TOC entry 4952 (class 2606 OID 321981)
-- Name: Order Order_orderNumber_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key36" UNIQUE ("orderNumber");


--
-- TOC entry 4954 (class 2606 OID 321983)
-- Name: Order Order_orderNumber_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key37" UNIQUE ("orderNumber");


--
-- TOC entry 4956 (class 2606 OID 321985)
-- Name: Order Order_orderNumber_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key38" UNIQUE ("orderNumber");


--
-- TOC entry 4958 (class 2606 OID 321987)
-- Name: Order Order_orderNumber_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key39" UNIQUE ("orderNumber");


--
-- TOC entry 4960 (class 2606 OID 321989)
-- Name: Order Order_orderNumber_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key4" UNIQUE ("orderNumber");


--
-- TOC entry 4962 (class 2606 OID 321991)
-- Name: Order Order_orderNumber_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key40" UNIQUE ("orderNumber");


--
-- TOC entry 4964 (class 2606 OID 321993)
-- Name: Order Order_orderNumber_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key41" UNIQUE ("orderNumber");


--
-- TOC entry 4966 (class 2606 OID 321995)
-- Name: Order Order_orderNumber_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key42" UNIQUE ("orderNumber");


--
-- TOC entry 4968 (class 2606 OID 321997)
-- Name: Order Order_orderNumber_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key43" UNIQUE ("orderNumber");


--
-- TOC entry 4970 (class 2606 OID 321999)
-- Name: Order Order_orderNumber_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key44" UNIQUE ("orderNumber");


--
-- TOC entry 4972 (class 2606 OID 322001)
-- Name: Order Order_orderNumber_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key45" UNIQUE ("orderNumber");


--
-- TOC entry 4974 (class 2606 OID 322003)
-- Name: Order Order_orderNumber_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key46" UNIQUE ("orderNumber");


--
-- TOC entry 4976 (class 2606 OID 322005)
-- Name: Order Order_orderNumber_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key47" UNIQUE ("orderNumber");


--
-- TOC entry 4978 (class 2606 OID 322007)
-- Name: Order Order_orderNumber_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key48" UNIQUE ("orderNumber");


--
-- TOC entry 4980 (class 2606 OID 322009)
-- Name: Order Order_orderNumber_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key49" UNIQUE ("orderNumber");


--
-- TOC entry 4982 (class 2606 OID 322011)
-- Name: Order Order_orderNumber_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key5" UNIQUE ("orderNumber");


--
-- TOC entry 4984 (class 2606 OID 322013)
-- Name: Order Order_orderNumber_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key50" UNIQUE ("orderNumber");


--
-- TOC entry 4986 (class 2606 OID 322015)
-- Name: Order Order_orderNumber_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key51" UNIQUE ("orderNumber");


--
-- TOC entry 4988 (class 2606 OID 322017)
-- Name: Order Order_orderNumber_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key52" UNIQUE ("orderNumber");


--
-- TOC entry 4990 (class 2606 OID 322019)
-- Name: Order Order_orderNumber_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key53" UNIQUE ("orderNumber");


--
-- TOC entry 4992 (class 2606 OID 322021)
-- Name: Order Order_orderNumber_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key54" UNIQUE ("orderNumber");


--
-- TOC entry 4994 (class 2606 OID 322023)
-- Name: Order Order_orderNumber_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key55" UNIQUE ("orderNumber");


--
-- TOC entry 4996 (class 2606 OID 322025)
-- Name: Order Order_orderNumber_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key56" UNIQUE ("orderNumber");


--
-- TOC entry 4998 (class 2606 OID 322027)
-- Name: Order Order_orderNumber_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key57" UNIQUE ("orderNumber");


--
-- TOC entry 5000 (class 2606 OID 322029)
-- Name: Order Order_orderNumber_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key58" UNIQUE ("orderNumber");


--
-- TOC entry 5002 (class 2606 OID 322031)
-- Name: Order Order_orderNumber_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key59" UNIQUE ("orderNumber");


--
-- TOC entry 5004 (class 2606 OID 322033)
-- Name: Order Order_orderNumber_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key6" UNIQUE ("orderNumber");


--
-- TOC entry 5006 (class 2606 OID 322035)
-- Name: Order Order_orderNumber_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key60" UNIQUE ("orderNumber");


--
-- TOC entry 5008 (class 2606 OID 322037)
-- Name: Order Order_orderNumber_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key61" UNIQUE ("orderNumber");


--
-- TOC entry 5010 (class 2606 OID 322039)
-- Name: Order Order_orderNumber_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key62" UNIQUE ("orderNumber");


--
-- TOC entry 5012 (class 2606 OID 322041)
-- Name: Order Order_orderNumber_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key63" UNIQUE ("orderNumber");


--
-- TOC entry 5014 (class 2606 OID 322043)
-- Name: Order Order_orderNumber_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key64" UNIQUE ("orderNumber");


--
-- TOC entry 5016 (class 2606 OID 322045)
-- Name: Order Order_orderNumber_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key65" UNIQUE ("orderNumber");


--
-- TOC entry 5018 (class 2606 OID 322047)
-- Name: Order Order_orderNumber_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key66" UNIQUE ("orderNumber");


--
-- TOC entry 5020 (class 2606 OID 322049)
-- Name: Order Order_orderNumber_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key67" UNIQUE ("orderNumber");


--
-- TOC entry 5022 (class 2606 OID 322051)
-- Name: Order Order_orderNumber_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key68" UNIQUE ("orderNumber");


--
-- TOC entry 5024 (class 2606 OID 322053)
-- Name: Order Order_orderNumber_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key69" UNIQUE ("orderNumber");


--
-- TOC entry 5026 (class 2606 OID 322055)
-- Name: Order Order_orderNumber_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key7" UNIQUE ("orderNumber");


--
-- TOC entry 5028 (class 2606 OID 322057)
-- Name: Order Order_orderNumber_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key70" UNIQUE ("orderNumber");


--
-- TOC entry 5030 (class 2606 OID 322059)
-- Name: Order Order_orderNumber_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key71" UNIQUE ("orderNumber");


--
-- TOC entry 5032 (class 2606 OID 322061)
-- Name: Order Order_orderNumber_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key72" UNIQUE ("orderNumber");


--
-- TOC entry 5034 (class 2606 OID 322063)
-- Name: Order Order_orderNumber_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key73" UNIQUE ("orderNumber");


--
-- TOC entry 5036 (class 2606 OID 322065)
-- Name: Order Order_orderNumber_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key74" UNIQUE ("orderNumber");


--
-- TOC entry 5038 (class 2606 OID 322067)
-- Name: Order Order_orderNumber_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key75" UNIQUE ("orderNumber");


--
-- TOC entry 5040 (class 2606 OID 322069)
-- Name: Order Order_orderNumber_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key76" UNIQUE ("orderNumber");


--
-- TOC entry 5042 (class 2606 OID 322071)
-- Name: Order Order_orderNumber_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key77" UNIQUE ("orderNumber");


--
-- TOC entry 5044 (class 2606 OID 322073)
-- Name: Order Order_orderNumber_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key78" UNIQUE ("orderNumber");


--
-- TOC entry 5046 (class 2606 OID 322075)
-- Name: Order Order_orderNumber_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key79" UNIQUE ("orderNumber");


--
-- TOC entry 5048 (class 2606 OID 322077)
-- Name: Order Order_orderNumber_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key8" UNIQUE ("orderNumber");


--
-- TOC entry 5050 (class 2606 OID 322079)
-- Name: Order Order_orderNumber_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key80" UNIQUE ("orderNumber");


--
-- TOC entry 5052 (class 2606 OID 322081)
-- Name: Order Order_orderNumber_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key81" UNIQUE ("orderNumber");


--
-- TOC entry 5054 (class 2606 OID 322083)
-- Name: Order Order_orderNumber_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key82" UNIQUE ("orderNumber");


--
-- TOC entry 5056 (class 2606 OID 322085)
-- Name: Order Order_orderNumber_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key83" UNIQUE ("orderNumber");


--
-- TOC entry 5058 (class 2606 OID 322087)
-- Name: Order Order_orderNumber_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key84" UNIQUE ("orderNumber");


--
-- TOC entry 5060 (class 2606 OID 322089)
-- Name: Order Order_orderNumber_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key85" UNIQUE ("orderNumber");


--
-- TOC entry 5062 (class 2606 OID 322091)
-- Name: Order Order_orderNumber_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key86" UNIQUE ("orderNumber");


--
-- TOC entry 5064 (class 2606 OID 322093)
-- Name: Order Order_orderNumber_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key87" UNIQUE ("orderNumber");


--
-- TOC entry 5066 (class 2606 OID 322095)
-- Name: Order Order_orderNumber_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key88" UNIQUE ("orderNumber");


--
-- TOC entry 5068 (class 2606 OID 322097)
-- Name: Order Order_orderNumber_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key89" UNIQUE ("orderNumber");


--
-- TOC entry 5070 (class 2606 OID 321699)
-- Name: Order Order_orderNumber_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key9" UNIQUE ("orderNumber");


--
-- TOC entry 5072 (class 2606 OID 321701)
-- Name: Order Order_orderNumber_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key90" UNIQUE ("orderNumber");


--
-- TOC entry 5074 (class 2606 OID 321703)
-- Name: Order Order_orderNumber_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key91" UNIQUE ("orderNumber");


--
-- TOC entry 5076 (class 2606 OID 321705)
-- Name: Order Order_orderNumber_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key92" UNIQUE ("orderNumber");


--
-- TOC entry 5078 (class 2606 OID 321707)
-- Name: Order Order_orderNumber_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key93" UNIQUE ("orderNumber");


--
-- TOC entry 5080 (class 2606 OID 321709)
-- Name: Order Order_orderNumber_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key94" UNIQUE ("orderNumber");


--
-- TOC entry 5082 (class 2606 OID 321711)
-- Name: Order Order_orderNumber_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key95" UNIQUE ("orderNumber");


--
-- TOC entry 5084 (class 2606 OID 321713)
-- Name: Order Order_orderNumber_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key96" UNIQUE ("orderNumber");


--
-- TOC entry 5086 (class 2606 OID 321715)
-- Name: Order Order_orderNumber_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key97" UNIQUE ("orderNumber");


--
-- TOC entry 5088 (class 2606 OID 321717)
-- Name: Order Order_orderNumber_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key98" UNIQUE ("orderNumber");


--
-- TOC entry 5090 (class 2606 OID 321719)
-- Name: Order Order_orderNumber_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key99" UNIQUE ("orderNumber");


--
-- TOC entry 5092 (class 2606 OID 51856)
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- TOC entry 5096 (class 2606 OID 51858)
-- Name: Payment Payment_brandSubscriptionId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_brandSubscriptionId_key" UNIQUE ("brandSubscriptionId");


--
-- TOC entry 5098 (class 2606 OID 51860)
-- Name: Payment Payment_orderId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_key" UNIQUE ("orderId");


--
-- TOC entry 5100 (class 2606 OID 51862)
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- TOC entry 5102 (class 2606 OID 322621)
-- Name: Payment Payment_stripePaymentIntentId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5104 (class 2606 OID 322623)
-- Name: Payment Payment_stripePaymentIntentId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key1" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5106 (class 2606 OID 322625)
-- Name: Payment Payment_stripePaymentIntentId_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key10" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5108 (class 2606 OID 322627)
-- Name: Payment Payment_stripePaymentIntentId_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key100" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5110 (class 2606 OID 322629)
-- Name: Payment Payment_stripePaymentIntentId_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key101" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5112 (class 2606 OID 322631)
-- Name: Payment Payment_stripePaymentIntentId_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key102" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5114 (class 2606 OID 322633)
-- Name: Payment Payment_stripePaymentIntentId_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key103" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5116 (class 2606 OID 322635)
-- Name: Payment Payment_stripePaymentIntentId_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key104" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5118 (class 2606 OID 322637)
-- Name: Payment Payment_stripePaymentIntentId_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key105" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5120 (class 2606 OID 322639)
-- Name: Payment Payment_stripePaymentIntentId_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key106" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5122 (class 2606 OID 322641)
-- Name: Payment Payment_stripePaymentIntentId_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key107" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5124 (class 2606 OID 322643)
-- Name: Payment Payment_stripePaymentIntentId_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key108" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5126 (class 2606 OID 322645)
-- Name: Payment Payment_stripePaymentIntentId_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key109" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5128 (class 2606 OID 322647)
-- Name: Payment Payment_stripePaymentIntentId_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key11" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5130 (class 2606 OID 322649)
-- Name: Payment Payment_stripePaymentIntentId_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key110" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5132 (class 2606 OID 322651)
-- Name: Payment Payment_stripePaymentIntentId_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key111" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5134 (class 2606 OID 322653)
-- Name: Payment Payment_stripePaymentIntentId_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key112" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5136 (class 2606 OID 322655)
-- Name: Payment Payment_stripePaymentIntentId_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key113" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5138 (class 2606 OID 322493)
-- Name: Payment Payment_stripePaymentIntentId_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key114" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5140 (class 2606 OID 322619)
-- Name: Payment Payment_stripePaymentIntentId_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key115" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5142 (class 2606 OID 322495)
-- Name: Payment Payment_stripePaymentIntentId_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key116" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5144 (class 2606 OID 322497)
-- Name: Payment Payment_stripePaymentIntentId_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key117" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5146 (class 2606 OID 322617)
-- Name: Payment Payment_stripePaymentIntentId_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key118" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5148 (class 2606 OID 322499)
-- Name: Payment Payment_stripePaymentIntentId_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key119" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5150 (class 2606 OID 322657)
-- Name: Payment Payment_stripePaymentIntentId_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key12" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5152 (class 2606 OID 322615)
-- Name: Payment Payment_stripePaymentIntentId_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key120" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5154 (class 2606 OID 322501)
-- Name: Payment Payment_stripePaymentIntentId_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key121" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5156 (class 2606 OID 322613)
-- Name: Payment Payment_stripePaymentIntentId_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key122" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5158 (class 2606 OID 322503)
-- Name: Payment Payment_stripePaymentIntentId_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key123" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5160 (class 2606 OID 322505)
-- Name: Payment Payment_stripePaymentIntentId_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key124" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5162 (class 2606 OID 322611)
-- Name: Payment Payment_stripePaymentIntentId_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key125" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5164 (class 2606 OID 322507)
-- Name: Payment Payment_stripePaymentIntentId_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key126" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5166 (class 2606 OID 322509)
-- Name: Payment Payment_stripePaymentIntentId_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key127" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5168 (class 2606 OID 322511)
-- Name: Payment Payment_stripePaymentIntentId_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key128" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5170 (class 2606 OID 322609)
-- Name: Payment Payment_stripePaymentIntentId_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key129" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5172 (class 2606 OID 322659)
-- Name: Payment Payment_stripePaymentIntentId_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key13" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5174 (class 2606 OID 322513)
-- Name: Payment Payment_stripePaymentIntentId_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key130" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5176 (class 2606 OID 322607)
-- Name: Payment Payment_stripePaymentIntentId_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key131" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5178 (class 2606 OID 322515)
-- Name: Payment Payment_stripePaymentIntentId_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key132" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5180 (class 2606 OID 322517)
-- Name: Payment Payment_stripePaymentIntentId_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key133" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5182 (class 2606 OID 322519)
-- Name: Payment Payment_stripePaymentIntentId_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key134" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5184 (class 2606 OID 322605)
-- Name: Payment Payment_stripePaymentIntentId_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key135" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5186 (class 2606 OID 322521)
-- Name: Payment Payment_stripePaymentIntentId_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key136" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5188 (class 2606 OID 322523)
-- Name: Payment Payment_stripePaymentIntentId_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key137" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5190 (class 2606 OID 322525)
-- Name: Payment Payment_stripePaymentIntentId_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key138" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5192 (class 2606 OID 322603)
-- Name: Payment Payment_stripePaymentIntentId_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key139" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5194 (class 2606 OID 322661)
-- Name: Payment Payment_stripePaymentIntentId_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key14" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5196 (class 2606 OID 322527)
-- Name: Payment Payment_stripePaymentIntentId_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key140" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5198 (class 2606 OID 322601)
-- Name: Payment Payment_stripePaymentIntentId_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key141" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5200 (class 2606 OID 322529)
-- Name: Payment Payment_stripePaymentIntentId_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key142" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5202 (class 2606 OID 322599)
-- Name: Payment Payment_stripePaymentIntentId_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key143" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5204 (class 2606 OID 322531)
-- Name: Payment Payment_stripePaymentIntentId_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key144" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5206 (class 2606 OID 322597)
-- Name: Payment Payment_stripePaymentIntentId_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key145" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5208 (class 2606 OID 322533)
-- Name: Payment Payment_stripePaymentIntentId_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key146" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5210 (class 2606 OID 322595)
-- Name: Payment Payment_stripePaymentIntentId_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key147" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5212 (class 2606 OID 322535)
-- Name: Payment Payment_stripePaymentIntentId_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key148" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5214 (class 2606 OID 322593)
-- Name: Payment Payment_stripePaymentIntentId_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key149" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5216 (class 2606 OID 322663)
-- Name: Payment Payment_stripePaymentIntentId_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key15" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5218 (class 2606 OID 322537)
-- Name: Payment Payment_stripePaymentIntentId_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key150" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5220 (class 2606 OID 322591)
-- Name: Payment Payment_stripePaymentIntentId_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key151" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5222 (class 2606 OID 322539)
-- Name: Payment Payment_stripePaymentIntentId_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key152" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5224 (class 2606 OID 322541)
-- Name: Payment Payment_stripePaymentIntentId_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key153" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5226 (class 2606 OID 322589)
-- Name: Payment Payment_stripePaymentIntentId_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key154" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5228 (class 2606 OID 322543)
-- Name: Payment Payment_stripePaymentIntentId_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key155" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5230 (class 2606 OID 322545)
-- Name: Payment Payment_stripePaymentIntentId_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key156" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5232 (class 2606 OID 322587)
-- Name: Payment Payment_stripePaymentIntentId_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key157" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5234 (class 2606 OID 322547)
-- Name: Payment Payment_stripePaymentIntentId_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key158" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5236 (class 2606 OID 322549)
-- Name: Payment Payment_stripePaymentIntentId_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key159" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5238 (class 2606 OID 322665)
-- Name: Payment Payment_stripePaymentIntentId_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key16" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5240 (class 2606 OID 322551)
-- Name: Payment Payment_stripePaymentIntentId_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key160" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5242 (class 2606 OID 322585)
-- Name: Payment Payment_stripePaymentIntentId_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key161" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5244 (class 2606 OID 322553)
-- Name: Payment Payment_stripePaymentIntentId_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key162" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5246 (class 2606 OID 322555)
-- Name: Payment Payment_stripePaymentIntentId_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key163" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5248 (class 2606 OID 322583)
-- Name: Payment Payment_stripePaymentIntentId_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key164" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5250 (class 2606 OID 322557)
-- Name: Payment Payment_stripePaymentIntentId_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key165" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5252 (class 2606 OID 322581)
-- Name: Payment Payment_stripePaymentIntentId_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key166" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5254 (class 2606 OID 322559)
-- Name: Payment Payment_stripePaymentIntentId_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key167" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5256 (class 2606 OID 322579)
-- Name: Payment Payment_stripePaymentIntentId_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key168" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5258 (class 2606 OID 322561)
-- Name: Payment Payment_stripePaymentIntentId_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key169" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5260 (class 2606 OID 322667)
-- Name: Payment Payment_stripePaymentIntentId_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key17" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5262 (class 2606 OID 322563)
-- Name: Payment Payment_stripePaymentIntentId_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key170" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5264 (class 2606 OID 322577)
-- Name: Payment Payment_stripePaymentIntentId_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key171" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5266 (class 2606 OID 322565)
-- Name: Payment Payment_stripePaymentIntentId_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key172" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5268 (class 2606 OID 322575)
-- Name: Payment Payment_stripePaymentIntentId_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key173" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5270 (class 2606 OID 322567)
-- Name: Payment Payment_stripePaymentIntentId_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key174" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5272 (class 2606 OID 322569)
-- Name: Payment Payment_stripePaymentIntentId_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key175" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5274 (class 2606 OID 322573)
-- Name: Payment Payment_stripePaymentIntentId_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key176" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5276 (class 2606 OID 322571)
-- Name: Payment Payment_stripePaymentIntentId_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key177" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5278 (class 2606 OID 322451)
-- Name: Payment Payment_stripePaymentIntentId_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key178" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5280 (class 2606 OID 322809)
-- Name: Payment Payment_stripePaymentIntentId_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key179" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5282 (class 2606 OID 322669)
-- Name: Payment Payment_stripePaymentIntentId_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key18" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5284 (class 2606 OID 322449)
-- Name: Payment Payment_stripePaymentIntentId_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key180" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5286 (class 2606 OID 322811)
-- Name: Payment Payment_stripePaymentIntentId_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key181" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5288 (class 2606 OID 322447)
-- Name: Payment Payment_stripePaymentIntentId_key182; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key182" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5290 (class 2606 OID 322813)
-- Name: Payment Payment_stripePaymentIntentId_key183; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key183" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5292 (class 2606 OID 322445)
-- Name: Payment Payment_stripePaymentIntentId_key184; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key184" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5294 (class 2606 OID 322815)
-- Name: Payment Payment_stripePaymentIntentId_key185; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key185" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5296 (class 2606 OID 322817)
-- Name: Payment Payment_stripePaymentIntentId_key186; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key186" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5298 (class 2606 OID 322443)
-- Name: Payment Payment_stripePaymentIntentId_key187; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key187" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5300 (class 2606 OID 322819)
-- Name: Payment Payment_stripePaymentIntentId_key188; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key188" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5302 (class 2606 OID 322441)
-- Name: Payment Payment_stripePaymentIntentId_key189; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key189" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5304 (class 2606 OID 322671)
-- Name: Payment Payment_stripePaymentIntentId_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key19" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5306 (class 2606 OID 322821)
-- Name: Payment Payment_stripePaymentIntentId_key190; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key190" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5308 (class 2606 OID 322439)
-- Name: Payment Payment_stripePaymentIntentId_key191; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key191" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5310 (class 2606 OID 322823)
-- Name: Payment Payment_stripePaymentIntentId_key192; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key192" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5312 (class 2606 OID 322825)
-- Name: Payment Payment_stripePaymentIntentId_key193; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key193" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5314 (class 2606 OID 322437)
-- Name: Payment Payment_stripePaymentIntentId_key194; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key194" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5316 (class 2606 OID 322827)
-- Name: Payment Payment_stripePaymentIntentId_key195; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key195" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5318 (class 2606 OID 322829)
-- Name: Payment Payment_stripePaymentIntentId_key196; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key196" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5320 (class 2606 OID 322435)
-- Name: Payment Payment_stripePaymentIntentId_key197; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key197" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5322 (class 2606 OID 322831)
-- Name: Payment Payment_stripePaymentIntentId_key198; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key198" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5324 (class 2606 OID 322433)
-- Name: Payment Payment_stripePaymentIntentId_key199; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key199" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5326 (class 2606 OID 322673)
-- Name: Payment Payment_stripePaymentIntentId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key2" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5328 (class 2606 OID 322675)
-- Name: Payment Payment_stripePaymentIntentId_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key20" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5330 (class 2606 OID 322833)
-- Name: Payment Payment_stripePaymentIntentId_key200; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key200" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5332 (class 2606 OID 322835)
-- Name: Payment Payment_stripePaymentIntentId_key201; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key201" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5334 (class 2606 OID 322431)
-- Name: Payment Payment_stripePaymentIntentId_key202; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key202" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5336 (class 2606 OID 322677)
-- Name: Payment Payment_stripePaymentIntentId_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key21" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5338 (class 2606 OID 322679)
-- Name: Payment Payment_stripePaymentIntentId_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key22" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5340 (class 2606 OID 322681)
-- Name: Payment Payment_stripePaymentIntentId_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key23" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5342 (class 2606 OID 322683)
-- Name: Payment Payment_stripePaymentIntentId_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key24" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5344 (class 2606 OID 322685)
-- Name: Payment Payment_stripePaymentIntentId_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key25" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5346 (class 2606 OID 322687)
-- Name: Payment Payment_stripePaymentIntentId_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key26" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5348 (class 2606 OID 322689)
-- Name: Payment Payment_stripePaymentIntentId_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key27" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5350 (class 2606 OID 322691)
-- Name: Payment Payment_stripePaymentIntentId_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key28" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5352 (class 2606 OID 322693)
-- Name: Payment Payment_stripePaymentIntentId_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key29" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5354 (class 2606 OID 322695)
-- Name: Payment Payment_stripePaymentIntentId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key3" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5356 (class 2606 OID 322697)
-- Name: Payment Payment_stripePaymentIntentId_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key30" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5358 (class 2606 OID 322699)
-- Name: Payment Payment_stripePaymentIntentId_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key31" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5360 (class 2606 OID 322701)
-- Name: Payment Payment_stripePaymentIntentId_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key32" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5362 (class 2606 OID 322703)
-- Name: Payment Payment_stripePaymentIntentId_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key33" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5364 (class 2606 OID 322705)
-- Name: Payment Payment_stripePaymentIntentId_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key34" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5366 (class 2606 OID 322707)
-- Name: Payment Payment_stripePaymentIntentId_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key35" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5368 (class 2606 OID 322709)
-- Name: Payment Payment_stripePaymentIntentId_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key36" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5370 (class 2606 OID 322711)
-- Name: Payment Payment_stripePaymentIntentId_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key37" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5372 (class 2606 OID 322713)
-- Name: Payment Payment_stripePaymentIntentId_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key38" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5374 (class 2606 OID 322715)
-- Name: Payment Payment_stripePaymentIntentId_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key39" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5376 (class 2606 OID 322717)
-- Name: Payment Payment_stripePaymentIntentId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key4" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5378 (class 2606 OID 322719)
-- Name: Payment Payment_stripePaymentIntentId_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key40" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5380 (class 2606 OID 322721)
-- Name: Payment Payment_stripePaymentIntentId_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key41" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5382 (class 2606 OID 322723)
-- Name: Payment Payment_stripePaymentIntentId_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key42" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5384 (class 2606 OID 322725)
-- Name: Payment Payment_stripePaymentIntentId_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key43" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5386 (class 2606 OID 322727)
-- Name: Payment Payment_stripePaymentIntentId_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key44" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5388 (class 2606 OID 322729)
-- Name: Payment Payment_stripePaymentIntentId_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key45" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5390 (class 2606 OID 322731)
-- Name: Payment Payment_stripePaymentIntentId_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key46" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5392 (class 2606 OID 322733)
-- Name: Payment Payment_stripePaymentIntentId_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key47" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5394 (class 2606 OID 322735)
-- Name: Payment Payment_stripePaymentIntentId_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key48" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5396 (class 2606 OID 322737)
-- Name: Payment Payment_stripePaymentIntentId_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key49" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5398 (class 2606 OID 322739)
-- Name: Payment Payment_stripePaymentIntentId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key5" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5400 (class 2606 OID 322741)
-- Name: Payment Payment_stripePaymentIntentId_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key50" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5402 (class 2606 OID 322743)
-- Name: Payment Payment_stripePaymentIntentId_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key51" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5404 (class 2606 OID 322745)
-- Name: Payment Payment_stripePaymentIntentId_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key52" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5406 (class 2606 OID 322747)
-- Name: Payment Payment_stripePaymentIntentId_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key53" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5408 (class 2606 OID 322749)
-- Name: Payment Payment_stripePaymentIntentId_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key54" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5410 (class 2606 OID 322751)
-- Name: Payment Payment_stripePaymentIntentId_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key55" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5412 (class 2606 OID 322753)
-- Name: Payment Payment_stripePaymentIntentId_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key56" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5414 (class 2606 OID 322755)
-- Name: Payment Payment_stripePaymentIntentId_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key57" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5416 (class 2606 OID 322757)
-- Name: Payment Payment_stripePaymentIntentId_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key58" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5418 (class 2606 OID 322759)
-- Name: Payment Payment_stripePaymentIntentId_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key59" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5420 (class 2606 OID 322761)
-- Name: Payment Payment_stripePaymentIntentId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key6" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5422 (class 2606 OID 322763)
-- Name: Payment Payment_stripePaymentIntentId_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key60" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5424 (class 2606 OID 322765)
-- Name: Payment Payment_stripePaymentIntentId_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key61" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5426 (class 2606 OID 322767)
-- Name: Payment Payment_stripePaymentIntentId_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key62" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5428 (class 2606 OID 322769)
-- Name: Payment Payment_stripePaymentIntentId_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key63" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5430 (class 2606 OID 322771)
-- Name: Payment Payment_stripePaymentIntentId_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key64" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5432 (class 2606 OID 322773)
-- Name: Payment Payment_stripePaymentIntentId_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key65" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5434 (class 2606 OID 322775)
-- Name: Payment Payment_stripePaymentIntentId_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key66" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5436 (class 2606 OID 322777)
-- Name: Payment Payment_stripePaymentIntentId_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key67" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5438 (class 2606 OID 322779)
-- Name: Payment Payment_stripePaymentIntentId_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key68" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5440 (class 2606 OID 322781)
-- Name: Payment Payment_stripePaymentIntentId_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key69" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5442 (class 2606 OID 322783)
-- Name: Payment Payment_stripePaymentIntentId_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key7" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5444 (class 2606 OID 322785)
-- Name: Payment Payment_stripePaymentIntentId_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key70" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5446 (class 2606 OID 322787)
-- Name: Payment Payment_stripePaymentIntentId_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key71" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5448 (class 2606 OID 322789)
-- Name: Payment Payment_stripePaymentIntentId_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key72" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5450 (class 2606 OID 322791)
-- Name: Payment Payment_stripePaymentIntentId_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key73" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5452 (class 2606 OID 322793)
-- Name: Payment Payment_stripePaymentIntentId_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key74" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5454 (class 2606 OID 322795)
-- Name: Payment Payment_stripePaymentIntentId_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key75" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5456 (class 2606 OID 322797)
-- Name: Payment Payment_stripePaymentIntentId_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key76" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5458 (class 2606 OID 322799)
-- Name: Payment Payment_stripePaymentIntentId_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key77" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5460 (class 2606 OID 322801)
-- Name: Payment Payment_stripePaymentIntentId_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key78" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5462 (class 2606 OID 322803)
-- Name: Payment Payment_stripePaymentIntentId_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key79" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5464 (class 2606 OID 322805)
-- Name: Payment Payment_stripePaymentIntentId_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key8" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5466 (class 2606 OID 322807)
-- Name: Payment Payment_stripePaymentIntentId_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key80" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5468 (class 2606 OID 322453)
-- Name: Payment Payment_stripePaymentIntentId_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key81" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5470 (class 2606 OID 322455)
-- Name: Payment Payment_stripePaymentIntentId_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key82" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5472 (class 2606 OID 322457)
-- Name: Payment Payment_stripePaymentIntentId_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key83" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5474 (class 2606 OID 322459)
-- Name: Payment Payment_stripePaymentIntentId_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key84" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5476 (class 2606 OID 322461)
-- Name: Payment Payment_stripePaymentIntentId_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key85" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5478 (class 2606 OID 322463)
-- Name: Payment Payment_stripePaymentIntentId_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key86" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5480 (class 2606 OID 322465)
-- Name: Payment Payment_stripePaymentIntentId_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key87" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5482 (class 2606 OID 322467)
-- Name: Payment Payment_stripePaymentIntentId_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key88" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5484 (class 2606 OID 322469)
-- Name: Payment Payment_stripePaymentIntentId_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key89" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5486 (class 2606 OID 322471)
-- Name: Payment Payment_stripePaymentIntentId_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key9" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5488 (class 2606 OID 322473)
-- Name: Payment Payment_stripePaymentIntentId_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key90" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5490 (class 2606 OID 322475)
-- Name: Payment Payment_stripePaymentIntentId_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key91" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5492 (class 2606 OID 322477)
-- Name: Payment Payment_stripePaymentIntentId_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key92" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5494 (class 2606 OID 322479)
-- Name: Payment Payment_stripePaymentIntentId_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key93" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5496 (class 2606 OID 322481)
-- Name: Payment Payment_stripePaymentIntentId_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key94" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5498 (class 2606 OID 322483)
-- Name: Payment Payment_stripePaymentIntentId_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key95" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5500 (class 2606 OID 322485)
-- Name: Payment Payment_stripePaymentIntentId_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key96" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5502 (class 2606 OID 322487)
-- Name: Payment Payment_stripePaymentIntentId_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key97" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5504 (class 2606 OID 322489)
-- Name: Payment Payment_stripePaymentIntentId_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key98" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5506 (class 2606 OID 322491)
-- Name: Payment Payment_stripePaymentIntentId_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key99" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 5508 (class 2606 OID 321240)
-- Name: Physician Physician_email_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key" UNIQUE (email);


--
-- TOC entry 5510 (class 2606 OID 321242)
-- Name: Physician Physician_email_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key1" UNIQUE (email);


--
-- TOC entry 5512 (class 2606 OID 321244)
-- Name: Physician Physician_email_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key10" UNIQUE (email);


--
-- TOC entry 5514 (class 2606 OID 321392)
-- Name: Physician Physician_email_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key100" UNIQUE (email);


--
-- TOC entry 5516 (class 2606 OID 321190)
-- Name: Physician Physician_email_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key101" UNIQUE (email);


--
-- TOC entry 5518 (class 2606 OID 321394)
-- Name: Physician Physician_email_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key102" UNIQUE (email);


--
-- TOC entry 5520 (class 2606 OID 321188)
-- Name: Physician Physician_email_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key103" UNIQUE (email);


--
-- TOC entry 5522 (class 2606 OID 321396)
-- Name: Physician Physician_email_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key104" UNIQUE (email);


--
-- TOC entry 5524 (class 2606 OID 321186)
-- Name: Physician Physician_email_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key105" UNIQUE (email);


--
-- TOC entry 5526 (class 2606 OID 321398)
-- Name: Physician Physician_email_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key106" UNIQUE (email);


--
-- TOC entry 5528 (class 2606 OID 321184)
-- Name: Physician Physician_email_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key107" UNIQUE (email);


--
-- TOC entry 5530 (class 2606 OID 321400)
-- Name: Physician Physician_email_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key108" UNIQUE (email);


--
-- TOC entry 5532 (class 2606 OID 321182)
-- Name: Physician Physician_email_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key109" UNIQUE (email);


--
-- TOC entry 5534 (class 2606 OID 321246)
-- Name: Physician Physician_email_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key11" UNIQUE (email);


--
-- TOC entry 5536 (class 2606 OID 321402)
-- Name: Physician Physician_email_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key110" UNIQUE (email);


--
-- TOC entry 5538 (class 2606 OID 321404)
-- Name: Physician Physician_email_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key111" UNIQUE (email);


--
-- TOC entry 5540 (class 2606 OID 321180)
-- Name: Physician Physician_email_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key112" UNIQUE (email);


--
-- TOC entry 5542 (class 2606 OID 321406)
-- Name: Physician Physician_email_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key113" UNIQUE (email);


--
-- TOC entry 5544 (class 2606 OID 321178)
-- Name: Physician Physician_email_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key114" UNIQUE (email);


--
-- TOC entry 5546 (class 2606 OID 321408)
-- Name: Physician Physician_email_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key115" UNIQUE (email);


--
-- TOC entry 5548 (class 2606 OID 321176)
-- Name: Physician Physician_email_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key116" UNIQUE (email);


--
-- TOC entry 5550 (class 2606 OID 321410)
-- Name: Physician Physician_email_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key117" UNIQUE (email);


--
-- TOC entry 5552 (class 2606 OID 321412)
-- Name: Physician Physician_email_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key118" UNIQUE (email);


--
-- TOC entry 5554 (class 2606 OID 321174)
-- Name: Physician Physician_email_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key119" UNIQUE (email);


--
-- TOC entry 5556 (class 2606 OID 321248)
-- Name: Physician Physician_email_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key12" UNIQUE (email);


--
-- TOC entry 5558 (class 2606 OID 321414)
-- Name: Physician Physician_email_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key120" UNIQUE (email);


--
-- TOC entry 5560 (class 2606 OID 321416)
-- Name: Physician Physician_email_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key121" UNIQUE (email);


--
-- TOC entry 5562 (class 2606 OID 321172)
-- Name: Physician Physician_email_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key122" UNIQUE (email);


--
-- TOC entry 5564 (class 2606 OID 321418)
-- Name: Physician Physician_email_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key123" UNIQUE (email);


--
-- TOC entry 5566 (class 2606 OID 321170)
-- Name: Physician Physician_email_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key124" UNIQUE (email);


--
-- TOC entry 5568 (class 2606 OID 321420)
-- Name: Physician Physician_email_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key125" UNIQUE (email);


--
-- TOC entry 5570 (class 2606 OID 321422)
-- Name: Physician Physician_email_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key126" UNIQUE (email);


--
-- TOC entry 5572 (class 2606 OID 321168)
-- Name: Physician Physician_email_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key127" UNIQUE (email);


--
-- TOC entry 5574 (class 2606 OID 321250)
-- Name: Physician Physician_email_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key13" UNIQUE (email);


--
-- TOC entry 5576 (class 2606 OID 321252)
-- Name: Physician Physician_email_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key14" UNIQUE (email);


--
-- TOC entry 5578 (class 2606 OID 321254)
-- Name: Physician Physician_email_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key15" UNIQUE (email);


--
-- TOC entry 5580 (class 2606 OID 321256)
-- Name: Physician Physician_email_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key16" UNIQUE (email);


--
-- TOC entry 5582 (class 2606 OID 321258)
-- Name: Physician Physician_email_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key17" UNIQUE (email);


--
-- TOC entry 5584 (class 2606 OID 321260)
-- Name: Physician Physician_email_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key18" UNIQUE (email);


--
-- TOC entry 5586 (class 2606 OID 321262)
-- Name: Physician Physician_email_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key19" UNIQUE (email);


--
-- TOC entry 5588 (class 2606 OID 321264)
-- Name: Physician Physician_email_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key2" UNIQUE (email);


--
-- TOC entry 5590 (class 2606 OID 321266)
-- Name: Physician Physician_email_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key20" UNIQUE (email);


--
-- TOC entry 5592 (class 2606 OID 321268)
-- Name: Physician Physician_email_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key21" UNIQUE (email);


--
-- TOC entry 5594 (class 2606 OID 321270)
-- Name: Physician Physician_email_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key22" UNIQUE (email);


--
-- TOC entry 5596 (class 2606 OID 321272)
-- Name: Physician Physician_email_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key23" UNIQUE (email);


--
-- TOC entry 5598 (class 2606 OID 321274)
-- Name: Physician Physician_email_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key24" UNIQUE (email);


--
-- TOC entry 5600 (class 2606 OID 321276)
-- Name: Physician Physician_email_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key25" UNIQUE (email);


--
-- TOC entry 5602 (class 2606 OID 321278)
-- Name: Physician Physician_email_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key26" UNIQUE (email);


--
-- TOC entry 5604 (class 2606 OID 321280)
-- Name: Physician Physician_email_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key27" UNIQUE (email);


--
-- TOC entry 5606 (class 2606 OID 321282)
-- Name: Physician Physician_email_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key28" UNIQUE (email);


--
-- TOC entry 5608 (class 2606 OID 321284)
-- Name: Physician Physician_email_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key29" UNIQUE (email);


--
-- TOC entry 5610 (class 2606 OID 321286)
-- Name: Physician Physician_email_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key3" UNIQUE (email);


--
-- TOC entry 5612 (class 2606 OID 321288)
-- Name: Physician Physician_email_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key30" UNIQUE (email);


--
-- TOC entry 5614 (class 2606 OID 321290)
-- Name: Physician Physician_email_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key31" UNIQUE (email);


--
-- TOC entry 5616 (class 2606 OID 321292)
-- Name: Physician Physician_email_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key32" UNIQUE (email);


--
-- TOC entry 5618 (class 2606 OID 321294)
-- Name: Physician Physician_email_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key33" UNIQUE (email);


--
-- TOC entry 5620 (class 2606 OID 321296)
-- Name: Physician Physician_email_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key34" UNIQUE (email);


--
-- TOC entry 5622 (class 2606 OID 321298)
-- Name: Physician Physician_email_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key35" UNIQUE (email);


--
-- TOC entry 5624 (class 2606 OID 321300)
-- Name: Physician Physician_email_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key36" UNIQUE (email);


--
-- TOC entry 5626 (class 2606 OID 321302)
-- Name: Physician Physician_email_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key37" UNIQUE (email);


--
-- TOC entry 5628 (class 2606 OID 321304)
-- Name: Physician Physician_email_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key38" UNIQUE (email);


--
-- TOC entry 5630 (class 2606 OID 321318)
-- Name: Physician Physician_email_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key39" UNIQUE (email);


--
-- TOC entry 5632 (class 2606 OID 321306)
-- Name: Physician Physician_email_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key4" UNIQUE (email);


--
-- TOC entry 5634 (class 2606 OID 321238)
-- Name: Physician Physician_email_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key40" UNIQUE (email);


--
-- TOC entry 5636 (class 2606 OID 321320)
-- Name: Physician Physician_email_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key41" UNIQUE (email);


--
-- TOC entry 5638 (class 2606 OID 321322)
-- Name: Physician Physician_email_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key42" UNIQUE (email);


--
-- TOC entry 5640 (class 2606 OID 321236)
-- Name: Physician Physician_email_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key43" UNIQUE (email);


--
-- TOC entry 5642 (class 2606 OID 321324)
-- Name: Physician Physician_email_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key44" UNIQUE (email);


--
-- TOC entry 5644 (class 2606 OID 321234)
-- Name: Physician Physician_email_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key45" UNIQUE (email);


--
-- TOC entry 5646 (class 2606 OID 321326)
-- Name: Physician Physician_email_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key46" UNIQUE (email);


--
-- TOC entry 5648 (class 2606 OID 321232)
-- Name: Physician Physician_email_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key47" UNIQUE (email);


--
-- TOC entry 5650 (class 2606 OID 321328)
-- Name: Physician Physician_email_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key48" UNIQUE (email);


--
-- TOC entry 5652 (class 2606 OID 321330)
-- Name: Physician Physician_email_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key49" UNIQUE (email);


--
-- TOC entry 5654 (class 2606 OID 321308)
-- Name: Physician Physician_email_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key5" UNIQUE (email);


--
-- TOC entry 5656 (class 2606 OID 321230)
-- Name: Physician Physician_email_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key50" UNIQUE (email);


--
-- TOC entry 5658 (class 2606 OID 321332)
-- Name: Physician Physician_email_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key51" UNIQUE (email);


--
-- TOC entry 5660 (class 2606 OID 321228)
-- Name: Physician Physician_email_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key52" UNIQUE (email);


--
-- TOC entry 5662 (class 2606 OID 321334)
-- Name: Physician Physician_email_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key53" UNIQUE (email);


--
-- TOC entry 5664 (class 2606 OID 321226)
-- Name: Physician Physician_email_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key54" UNIQUE (email);


--
-- TOC entry 5666 (class 2606 OID 321336)
-- Name: Physician Physician_email_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key55" UNIQUE (email);


--
-- TOC entry 5668 (class 2606 OID 321224)
-- Name: Physician Physician_email_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key56" UNIQUE (email);


--
-- TOC entry 5670 (class 2606 OID 321338)
-- Name: Physician Physician_email_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key57" UNIQUE (email);


--
-- TOC entry 5672 (class 2606 OID 321340)
-- Name: Physician Physician_email_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key58" UNIQUE (email);


--
-- TOC entry 5674 (class 2606 OID 321342)
-- Name: Physician Physician_email_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key59" UNIQUE (email);


--
-- TOC entry 5676 (class 2606 OID 321310)
-- Name: Physician Physician_email_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key6" UNIQUE (email);


--
-- TOC entry 5678 (class 2606 OID 321222)
-- Name: Physician Physician_email_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key60" UNIQUE (email);


--
-- TOC entry 5680 (class 2606 OID 321344)
-- Name: Physician Physician_email_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key61" UNIQUE (email);


--
-- TOC entry 5682 (class 2606 OID 321346)
-- Name: Physician Physician_email_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key62" UNIQUE (email);


--
-- TOC entry 5684 (class 2606 OID 321348)
-- Name: Physician Physician_email_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key63" UNIQUE (email);


--
-- TOC entry 5686 (class 2606 OID 321220)
-- Name: Physician Physician_email_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key64" UNIQUE (email);


--
-- TOC entry 5688 (class 2606 OID 321218)
-- Name: Physician Physician_email_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key65" UNIQUE (email);


--
-- TOC entry 5690 (class 2606 OID 321350)
-- Name: Physician Physician_email_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key66" UNIQUE (email);


--
-- TOC entry 5692 (class 2606 OID 321216)
-- Name: Physician Physician_email_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key67" UNIQUE (email);


--
-- TOC entry 5694 (class 2606 OID 321352)
-- Name: Physician Physician_email_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key68" UNIQUE (email);


--
-- TOC entry 5696 (class 2606 OID 321214)
-- Name: Physician Physician_email_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key69" UNIQUE (email);


--
-- TOC entry 5698 (class 2606 OID 321312)
-- Name: Physician Physician_email_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key7" UNIQUE (email);


--
-- TOC entry 5700 (class 2606 OID 321354)
-- Name: Physician Physician_email_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key70" UNIQUE (email);


--
-- TOC entry 5702 (class 2606 OID 321356)
-- Name: Physician Physician_email_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key71" UNIQUE (email);


--
-- TOC entry 5704 (class 2606 OID 321212)
-- Name: Physician Physician_email_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key72" UNIQUE (email);


--
-- TOC entry 5706 (class 2606 OID 321358)
-- Name: Physician Physician_email_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key73" UNIQUE (email);


--
-- TOC entry 5708 (class 2606 OID 321210)
-- Name: Physician Physician_email_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key74" UNIQUE (email);


--
-- TOC entry 5710 (class 2606 OID 321360)
-- Name: Physician Physician_email_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key75" UNIQUE (email);


--
-- TOC entry 5712 (class 2606 OID 321208)
-- Name: Physician Physician_email_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key76" UNIQUE (email);


--
-- TOC entry 5714 (class 2606 OID 321362)
-- Name: Physician Physician_email_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key77" UNIQUE (email);


--
-- TOC entry 5716 (class 2606 OID 321364)
-- Name: Physician Physician_email_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key78" UNIQUE (email);


--
-- TOC entry 5718 (class 2606 OID 321206)
-- Name: Physician Physician_email_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key79" UNIQUE (email);


--
-- TOC entry 5720 (class 2606 OID 321314)
-- Name: Physician Physician_email_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key8" UNIQUE (email);


--
-- TOC entry 5722 (class 2606 OID 321366)
-- Name: Physician Physician_email_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key80" UNIQUE (email);


--
-- TOC entry 5724 (class 2606 OID 321368)
-- Name: Physician Physician_email_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key81" UNIQUE (email);


--
-- TOC entry 5726 (class 2606 OID 321204)
-- Name: Physician Physician_email_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key82" UNIQUE (email);


--
-- TOC entry 5728 (class 2606 OID 321370)
-- Name: Physician Physician_email_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key83" UNIQUE (email);


--
-- TOC entry 5730 (class 2606 OID 321372)
-- Name: Physician Physician_email_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key84" UNIQUE (email);


--
-- TOC entry 5732 (class 2606 OID 321374)
-- Name: Physician Physician_email_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key85" UNIQUE (email);


--
-- TOC entry 5734 (class 2606 OID 321202)
-- Name: Physician Physician_email_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key86" UNIQUE (email);


--
-- TOC entry 5736 (class 2606 OID 321376)
-- Name: Physician Physician_email_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key87" UNIQUE (email);


--
-- TOC entry 5738 (class 2606 OID 321378)
-- Name: Physician Physician_email_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key88" UNIQUE (email);


--
-- TOC entry 5740 (class 2606 OID 321200)
-- Name: Physician Physician_email_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key89" UNIQUE (email);


--
-- TOC entry 5742 (class 2606 OID 321316)
-- Name: Physician Physician_email_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key9" UNIQUE (email);


--
-- TOC entry 5744 (class 2606 OID 321380)
-- Name: Physician Physician_email_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key90" UNIQUE (email);


--
-- TOC entry 5746 (class 2606 OID 321198)
-- Name: Physician Physician_email_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key91" UNIQUE (email);


--
-- TOC entry 5748 (class 2606 OID 321382)
-- Name: Physician Physician_email_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key92" UNIQUE (email);


--
-- TOC entry 5750 (class 2606 OID 321196)
-- Name: Physician Physician_email_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key93" UNIQUE (email);


--
-- TOC entry 5752 (class 2606 OID 321384)
-- Name: Physician Physician_email_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key94" UNIQUE (email);


--
-- TOC entry 5754 (class 2606 OID 321386)
-- Name: Physician Physician_email_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key95" UNIQUE (email);


--
-- TOC entry 5756 (class 2606 OID 321194)
-- Name: Physician Physician_email_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key96" UNIQUE (email);


--
-- TOC entry 5758 (class 2606 OID 321388)
-- Name: Physician Physician_email_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key97" UNIQUE (email);


--
-- TOC entry 5760 (class 2606 OID 321192)
-- Name: Physician Physician_email_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key98" UNIQUE (email);


--
-- TOC entry 5762 (class 2606 OID 321390)
-- Name: Physician Physician_email_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_email_key99" UNIQUE (email);


--
-- TOC entry 5764 (class 2606 OID 321500)
-- Name: Physician Physician_pharmacyPhysicianId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5766 (class 2606 OID 321502)
-- Name: Physician Physician_pharmacyPhysicianId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key1" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5768 (class 2606 OID 321504)
-- Name: Physician Physician_pharmacyPhysicianId_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key10" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5770 (class 2606 OID 321652)
-- Name: Physician Physician_pharmacyPhysicianId_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key100" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5772 (class 2606 OID 321450)
-- Name: Physician Physician_pharmacyPhysicianId_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key101" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5774 (class 2606 OID 321654)
-- Name: Physician Physician_pharmacyPhysicianId_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key102" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5776 (class 2606 OID 321448)
-- Name: Physician Physician_pharmacyPhysicianId_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key103" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5778 (class 2606 OID 321656)
-- Name: Physician Physician_pharmacyPhysicianId_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key104" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5780 (class 2606 OID 321446)
-- Name: Physician Physician_pharmacyPhysicianId_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key105" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5782 (class 2606 OID 321658)
-- Name: Physician Physician_pharmacyPhysicianId_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key106" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5784 (class 2606 OID 321444)
-- Name: Physician Physician_pharmacyPhysicianId_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key107" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5786 (class 2606 OID 321660)
-- Name: Physician Physician_pharmacyPhysicianId_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key108" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5788 (class 2606 OID 321442)
-- Name: Physician Physician_pharmacyPhysicianId_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key109" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5790 (class 2606 OID 321506)
-- Name: Physician Physician_pharmacyPhysicianId_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key11" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5792 (class 2606 OID 321662)
-- Name: Physician Physician_pharmacyPhysicianId_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key110" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5794 (class 2606 OID 321664)
-- Name: Physician Physician_pharmacyPhysicianId_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key111" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5796 (class 2606 OID 321440)
-- Name: Physician Physician_pharmacyPhysicianId_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key112" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5798 (class 2606 OID 321666)
-- Name: Physician Physician_pharmacyPhysicianId_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key113" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5800 (class 2606 OID 321438)
-- Name: Physician Physician_pharmacyPhysicianId_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key114" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5802 (class 2606 OID 321668)
-- Name: Physician Physician_pharmacyPhysicianId_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key115" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5804 (class 2606 OID 321436)
-- Name: Physician Physician_pharmacyPhysicianId_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key116" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5806 (class 2606 OID 321670)
-- Name: Physician Physician_pharmacyPhysicianId_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key117" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5808 (class 2606 OID 321672)
-- Name: Physician Physician_pharmacyPhysicianId_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key118" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5810 (class 2606 OID 321434)
-- Name: Physician Physician_pharmacyPhysicianId_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key119" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5812 (class 2606 OID 321508)
-- Name: Physician Physician_pharmacyPhysicianId_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key12" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5814 (class 2606 OID 321674)
-- Name: Physician Physician_pharmacyPhysicianId_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key120" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5816 (class 2606 OID 321676)
-- Name: Physician Physician_pharmacyPhysicianId_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key121" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5818 (class 2606 OID 321432)
-- Name: Physician Physician_pharmacyPhysicianId_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key122" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5820 (class 2606 OID 321678)
-- Name: Physician Physician_pharmacyPhysicianId_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key123" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5822 (class 2606 OID 321430)
-- Name: Physician Physician_pharmacyPhysicianId_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key124" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5824 (class 2606 OID 321680)
-- Name: Physician Physician_pharmacyPhysicianId_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key125" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5826 (class 2606 OID 321682)
-- Name: Physician Physician_pharmacyPhysicianId_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key126" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5828 (class 2606 OID 321428)
-- Name: Physician Physician_pharmacyPhysicianId_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key127" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5830 (class 2606 OID 321510)
-- Name: Physician Physician_pharmacyPhysicianId_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key13" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5832 (class 2606 OID 321512)
-- Name: Physician Physician_pharmacyPhysicianId_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key14" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5834 (class 2606 OID 321514)
-- Name: Physician Physician_pharmacyPhysicianId_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key15" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5836 (class 2606 OID 321516)
-- Name: Physician Physician_pharmacyPhysicianId_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key16" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5838 (class 2606 OID 321518)
-- Name: Physician Physician_pharmacyPhysicianId_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key17" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5840 (class 2606 OID 321520)
-- Name: Physician Physician_pharmacyPhysicianId_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key18" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5842 (class 2606 OID 321522)
-- Name: Physician Physician_pharmacyPhysicianId_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key19" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5844 (class 2606 OID 321524)
-- Name: Physician Physician_pharmacyPhysicianId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key2" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5846 (class 2606 OID 321526)
-- Name: Physician Physician_pharmacyPhysicianId_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key20" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5848 (class 2606 OID 321528)
-- Name: Physician Physician_pharmacyPhysicianId_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key21" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5850 (class 2606 OID 321530)
-- Name: Physician Physician_pharmacyPhysicianId_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key22" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5852 (class 2606 OID 321532)
-- Name: Physician Physician_pharmacyPhysicianId_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key23" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5854 (class 2606 OID 321534)
-- Name: Physician Physician_pharmacyPhysicianId_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key24" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5856 (class 2606 OID 321536)
-- Name: Physician Physician_pharmacyPhysicianId_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key25" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5858 (class 2606 OID 321538)
-- Name: Physician Physician_pharmacyPhysicianId_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key26" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5860 (class 2606 OID 321540)
-- Name: Physician Physician_pharmacyPhysicianId_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key27" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5862 (class 2606 OID 321542)
-- Name: Physician Physician_pharmacyPhysicianId_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key28" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5864 (class 2606 OID 321544)
-- Name: Physician Physician_pharmacyPhysicianId_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key29" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5866 (class 2606 OID 321546)
-- Name: Physician Physician_pharmacyPhysicianId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key3" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5868 (class 2606 OID 321548)
-- Name: Physician Physician_pharmacyPhysicianId_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key30" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5870 (class 2606 OID 321550)
-- Name: Physician Physician_pharmacyPhysicianId_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key31" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5872 (class 2606 OID 321552)
-- Name: Physician Physician_pharmacyPhysicianId_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key32" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5874 (class 2606 OID 321554)
-- Name: Physician Physician_pharmacyPhysicianId_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key33" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5876 (class 2606 OID 321556)
-- Name: Physician Physician_pharmacyPhysicianId_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key34" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5878 (class 2606 OID 321558)
-- Name: Physician Physician_pharmacyPhysicianId_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key35" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5880 (class 2606 OID 321560)
-- Name: Physician Physician_pharmacyPhysicianId_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key36" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5882 (class 2606 OID 321562)
-- Name: Physician Physician_pharmacyPhysicianId_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key37" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5884 (class 2606 OID 321564)
-- Name: Physician Physician_pharmacyPhysicianId_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key38" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5886 (class 2606 OID 321578)
-- Name: Physician Physician_pharmacyPhysicianId_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key39" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5888 (class 2606 OID 321566)
-- Name: Physician Physician_pharmacyPhysicianId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key4" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5890 (class 2606 OID 321498)
-- Name: Physician Physician_pharmacyPhysicianId_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key40" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5892 (class 2606 OID 321580)
-- Name: Physician Physician_pharmacyPhysicianId_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key41" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5894 (class 2606 OID 321582)
-- Name: Physician Physician_pharmacyPhysicianId_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key42" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5896 (class 2606 OID 321496)
-- Name: Physician Physician_pharmacyPhysicianId_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key43" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5898 (class 2606 OID 321584)
-- Name: Physician Physician_pharmacyPhysicianId_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key44" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5900 (class 2606 OID 321494)
-- Name: Physician Physician_pharmacyPhysicianId_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key45" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5902 (class 2606 OID 321586)
-- Name: Physician Physician_pharmacyPhysicianId_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key46" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5904 (class 2606 OID 321492)
-- Name: Physician Physician_pharmacyPhysicianId_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key47" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5906 (class 2606 OID 321588)
-- Name: Physician Physician_pharmacyPhysicianId_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key48" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5908 (class 2606 OID 321590)
-- Name: Physician Physician_pharmacyPhysicianId_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key49" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5910 (class 2606 OID 321568)
-- Name: Physician Physician_pharmacyPhysicianId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key5" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5912 (class 2606 OID 321490)
-- Name: Physician Physician_pharmacyPhysicianId_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key50" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5914 (class 2606 OID 321592)
-- Name: Physician Physician_pharmacyPhysicianId_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key51" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5916 (class 2606 OID 321488)
-- Name: Physician Physician_pharmacyPhysicianId_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key52" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5918 (class 2606 OID 321594)
-- Name: Physician Physician_pharmacyPhysicianId_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key53" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5920 (class 2606 OID 321486)
-- Name: Physician Physician_pharmacyPhysicianId_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key54" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5922 (class 2606 OID 321596)
-- Name: Physician Physician_pharmacyPhysicianId_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key55" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5924 (class 2606 OID 321484)
-- Name: Physician Physician_pharmacyPhysicianId_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key56" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5926 (class 2606 OID 321598)
-- Name: Physician Physician_pharmacyPhysicianId_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key57" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5928 (class 2606 OID 321600)
-- Name: Physician Physician_pharmacyPhysicianId_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key58" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5930 (class 2606 OID 321602)
-- Name: Physician Physician_pharmacyPhysicianId_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key59" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5932 (class 2606 OID 321570)
-- Name: Physician Physician_pharmacyPhysicianId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key6" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5934 (class 2606 OID 321482)
-- Name: Physician Physician_pharmacyPhysicianId_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key60" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5936 (class 2606 OID 321604)
-- Name: Physician Physician_pharmacyPhysicianId_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key61" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5938 (class 2606 OID 321606)
-- Name: Physician Physician_pharmacyPhysicianId_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key62" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5940 (class 2606 OID 321608)
-- Name: Physician Physician_pharmacyPhysicianId_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key63" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5942 (class 2606 OID 321480)
-- Name: Physician Physician_pharmacyPhysicianId_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key64" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5944 (class 2606 OID 321478)
-- Name: Physician Physician_pharmacyPhysicianId_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key65" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5946 (class 2606 OID 321610)
-- Name: Physician Physician_pharmacyPhysicianId_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key66" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5948 (class 2606 OID 321476)
-- Name: Physician Physician_pharmacyPhysicianId_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key67" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5950 (class 2606 OID 321612)
-- Name: Physician Physician_pharmacyPhysicianId_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key68" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5952 (class 2606 OID 321474)
-- Name: Physician Physician_pharmacyPhysicianId_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key69" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5954 (class 2606 OID 321572)
-- Name: Physician Physician_pharmacyPhysicianId_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key7" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5956 (class 2606 OID 321614)
-- Name: Physician Physician_pharmacyPhysicianId_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key70" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5958 (class 2606 OID 321616)
-- Name: Physician Physician_pharmacyPhysicianId_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key71" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5960 (class 2606 OID 321472)
-- Name: Physician Physician_pharmacyPhysicianId_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key72" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5962 (class 2606 OID 321618)
-- Name: Physician Physician_pharmacyPhysicianId_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key73" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5964 (class 2606 OID 321470)
-- Name: Physician Physician_pharmacyPhysicianId_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key74" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5966 (class 2606 OID 321620)
-- Name: Physician Physician_pharmacyPhysicianId_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key75" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5968 (class 2606 OID 321468)
-- Name: Physician Physician_pharmacyPhysicianId_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key76" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5970 (class 2606 OID 321622)
-- Name: Physician Physician_pharmacyPhysicianId_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key77" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5972 (class 2606 OID 321624)
-- Name: Physician Physician_pharmacyPhysicianId_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key78" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5974 (class 2606 OID 321466)
-- Name: Physician Physician_pharmacyPhysicianId_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key79" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5976 (class 2606 OID 321574)
-- Name: Physician Physician_pharmacyPhysicianId_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key8" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5978 (class 2606 OID 321626)
-- Name: Physician Physician_pharmacyPhysicianId_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key80" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5980 (class 2606 OID 321628)
-- Name: Physician Physician_pharmacyPhysicianId_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key81" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5982 (class 2606 OID 321464)
-- Name: Physician Physician_pharmacyPhysicianId_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key82" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5984 (class 2606 OID 321630)
-- Name: Physician Physician_pharmacyPhysicianId_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key83" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5986 (class 2606 OID 321632)
-- Name: Physician Physician_pharmacyPhysicianId_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key84" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5988 (class 2606 OID 321634)
-- Name: Physician Physician_pharmacyPhysicianId_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key85" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5990 (class 2606 OID 321462)
-- Name: Physician Physician_pharmacyPhysicianId_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key86" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5992 (class 2606 OID 321636)
-- Name: Physician Physician_pharmacyPhysicianId_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key87" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5994 (class 2606 OID 321638)
-- Name: Physician Physician_pharmacyPhysicianId_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key88" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5996 (class 2606 OID 321460)
-- Name: Physician Physician_pharmacyPhysicianId_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key89" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 5998 (class 2606 OID 321576)
-- Name: Physician Physician_pharmacyPhysicianId_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key9" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6000 (class 2606 OID 321640)
-- Name: Physician Physician_pharmacyPhysicianId_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key90" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6002 (class 2606 OID 321458)
-- Name: Physician Physician_pharmacyPhysicianId_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key91" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6004 (class 2606 OID 321642)
-- Name: Physician Physician_pharmacyPhysicianId_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key92" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6006 (class 2606 OID 321456)
-- Name: Physician Physician_pharmacyPhysicianId_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key93" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6008 (class 2606 OID 321644)
-- Name: Physician Physician_pharmacyPhysicianId_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key94" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6010 (class 2606 OID 321646)
-- Name: Physician Physician_pharmacyPhysicianId_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key95" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6012 (class 2606 OID 321454)
-- Name: Physician Physician_pharmacyPhysicianId_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key96" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6014 (class 2606 OID 321648)
-- Name: Physician Physician_pharmacyPhysicianId_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key97" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6016 (class 2606 OID 321452)
-- Name: Physician Physician_pharmacyPhysicianId_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key98" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6018 (class 2606 OID 321650)
-- Name: Physician Physician_pharmacyPhysicianId_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pharmacyPhysicianId_key99" UNIQUE ("pharmacyPhysicianId");


--
-- TOC entry 6020 (class 2606 OID 52248)
-- Name: Physician Physician_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Physician"
    ADD CONSTRAINT "Physician_pkey" PRIMARY KEY (id);


--
-- TOC entry 6024 (class 2606 OID 52250)
-- Name: PrescriptionProducts PrescriptionProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_pkey" PRIMARY KEY (id);


--
-- TOC entry 6026 (class 2606 OID 52252)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_productId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_productId_key" UNIQUE ("prescriptionId", "productId");


--
-- TOC entry 6022 (class 2606 OID 52254)
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- TOC entry 6028 (class 2606 OID 52256)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 6030 (class 2606 OID 321039)
-- Name: Product Product_slug_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key" UNIQUE (slug);


--
-- TOC entry 6032 (class 2606 OID 321041)
-- Name: Product Product_slug_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key1" UNIQUE (slug);


--
-- TOC entry 6034 (class 2606 OID 321051)
-- Name: Product Product_slug_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key10" UNIQUE (slug);


--
-- TOC entry 6036 (class 2606 OID 321029)
-- Name: Product Product_slug_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key11" UNIQUE (slug);


--
-- TOC entry 6038 (class 2606 OID 321053)
-- Name: Product Product_slug_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key12" UNIQUE (slug);


--
-- TOC entry 6040 (class 2606 OID 321055)
-- Name: Product Product_slug_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key13" UNIQUE (slug);


--
-- TOC entry 6042 (class 2606 OID 321027)
-- Name: Product Product_slug_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key14" UNIQUE (slug);


--
-- TOC entry 6044 (class 2606 OID 321057)
-- Name: Product Product_slug_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key15" UNIQUE (slug);


--
-- TOC entry 6046 (class 2606 OID 321059)
-- Name: Product Product_slug_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key16" UNIQUE (slug);


--
-- TOC entry 6048 (class 2606 OID 321025)
-- Name: Product Product_slug_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key17" UNIQUE (slug);


--
-- TOC entry 6050 (class 2606 OID 321061)
-- Name: Product Product_slug_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key18" UNIQUE (slug);


--
-- TOC entry 6052 (class 2606 OID 321023)
-- Name: Product Product_slug_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key19" UNIQUE (slug);


--
-- TOC entry 6054 (class 2606 OID 321037)
-- Name: Product Product_slug_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key2" UNIQUE (slug);


--
-- TOC entry 6056 (class 2606 OID 321063)
-- Name: Product Product_slug_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key20" UNIQUE (slug);


--
-- TOC entry 6058 (class 2606 OID 321065)
-- Name: Product Product_slug_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key21" UNIQUE (slug);


--
-- TOC entry 6060 (class 2606 OID 321021)
-- Name: Product Product_slug_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key22" UNIQUE (slug);


--
-- TOC entry 6062 (class 2606 OID 321043)
-- Name: Product Product_slug_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key3" UNIQUE (slug);


--
-- TOC entry 6064 (class 2606 OID 321035)
-- Name: Product Product_slug_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key4" UNIQUE (slug);


--
-- TOC entry 6066 (class 2606 OID 321045)
-- Name: Product Product_slug_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key5" UNIQUE (slug);


--
-- TOC entry 6068 (class 2606 OID 321047)
-- Name: Product Product_slug_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key6" UNIQUE (slug);


--
-- TOC entry 6070 (class 2606 OID 321033)
-- Name: Product Product_slug_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key7" UNIQUE (slug);


--
-- TOC entry 6072 (class 2606 OID 321049)
-- Name: Product Product_slug_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key8" UNIQUE (slug);


--
-- TOC entry 6074 (class 2606 OID 321031)
-- Name: Product Product_slug_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_slug_key9" UNIQUE (slug);


--
-- TOC entry 6078 (class 2606 OID 52258)
-- Name: QuestionOption QuestionOption_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionOption"
    ADD CONSTRAINT "QuestionOption_pkey" PRIMARY KEY (id);


--
-- TOC entry 6076 (class 2606 OID 52260)
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- TOC entry 6083 (class 2606 OID 52262)
-- Name: QuestionnaireStep QuestionnaireStep_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionnaireStep"
    ADD CONSTRAINT "QuestionnaireStep_pkey" PRIMARY KEY (id);


--
-- TOC entry 6080 (class 2606 OID 52264)
-- Name: Questionnaire Questionnaire_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_pkey" PRIMARY KEY (id);


--
-- TOC entry 6085 (class 2606 OID 52266)
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- TOC entry 6087 (class 2606 OID 52268)
-- Name: ShippingAddress ShippingAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY (id);


--
-- TOC entry 6089 (class 2606 OID 52270)
-- Name: ShippingOrder ShippingOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingOrder"
    ADD CONSTRAINT "ShippingOrder_pkey" PRIMARY KEY (id);


--
-- TOC entry 6091 (class 2606 OID 52272)
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- TOC entry 6093 (class 2606 OID 322912)
-- Name: Subscription Subscription_stripeSubscriptionId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6095 (class 2606 OID 322914)
-- Name: Subscription Subscription_stripeSubscriptionId_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key1" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6097 (class 2606 OID 322916)
-- Name: Subscription Subscription_stripeSubscriptionId_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key10" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6099 (class 2606 OID 323160)
-- Name: Subscription Subscription_stripeSubscriptionId_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key100" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6101 (class 2606 OID 322904)
-- Name: Subscription Subscription_stripeSubscriptionId_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key101" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6103 (class 2606 OID 323162)
-- Name: Subscription Subscription_stripeSubscriptionId_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key102" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6105 (class 2606 OID 323164)
-- Name: Subscription Subscription_stripeSubscriptionId_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key103" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6107 (class 2606 OID 322902)
-- Name: Subscription Subscription_stripeSubscriptionId_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key104" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6109 (class 2606 OID 323166)
-- Name: Subscription Subscription_stripeSubscriptionId_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key105" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6111 (class 2606 OID 322900)
-- Name: Subscription Subscription_stripeSubscriptionId_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key106" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6113 (class 2606 OID 323168)
-- Name: Subscription Subscription_stripeSubscriptionId_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key107" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6115 (class 2606 OID 322898)
-- Name: Subscription Subscription_stripeSubscriptionId_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key108" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6117 (class 2606 OID 323172)
-- Name: Subscription Subscription_stripeSubscriptionId_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key109" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6119 (class 2606 OID 322918)
-- Name: Subscription Subscription_stripeSubscriptionId_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key11" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6121 (class 2606 OID 322896)
-- Name: Subscription Subscription_stripeSubscriptionId_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key110" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6123 (class 2606 OID 323174)
-- Name: Subscription Subscription_stripeSubscriptionId_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key111" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6125 (class 2606 OID 323176)
-- Name: Subscription Subscription_stripeSubscriptionId_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key112" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6127 (class 2606 OID 323178)
-- Name: Subscription Subscription_stripeSubscriptionId_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key113" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6129 (class 2606 OID 322894)
-- Name: Subscription Subscription_stripeSubscriptionId_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key114" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6131 (class 2606 OID 323180)
-- Name: Subscription Subscription_stripeSubscriptionId_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key115" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6133 (class 2606 OID 323182)
-- Name: Subscription Subscription_stripeSubscriptionId_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key116" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6135 (class 2606 OID 323184)
-- Name: Subscription Subscription_stripeSubscriptionId_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key117" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6137 (class 2606 OID 322892)
-- Name: Subscription Subscription_stripeSubscriptionId_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key118" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6139 (class 2606 OID 323186)
-- Name: Subscription Subscription_stripeSubscriptionId_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key119" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6141 (class 2606 OID 322920)
-- Name: Subscription Subscription_stripeSubscriptionId_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key12" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6143 (class 2606 OID 322890)
-- Name: Subscription Subscription_stripeSubscriptionId_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key120" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6145 (class 2606 OID 323188)
-- Name: Subscription Subscription_stripeSubscriptionId_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key121" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6147 (class 2606 OID 322888)
-- Name: Subscription Subscription_stripeSubscriptionId_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key122" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6149 (class 2606 OID 323190)
-- Name: Subscription Subscription_stripeSubscriptionId_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key123" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6151 (class 2606 OID 322886)
-- Name: Subscription Subscription_stripeSubscriptionId_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key124" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6153 (class 2606 OID 323192)
-- Name: Subscription Subscription_stripeSubscriptionId_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key125" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6155 (class 2606 OID 322884)
-- Name: Subscription Subscription_stripeSubscriptionId_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key126" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6157 (class 2606 OID 323194)
-- Name: Subscription Subscription_stripeSubscriptionId_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key127" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6159 (class 2606 OID 322882)
-- Name: Subscription Subscription_stripeSubscriptionId_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key128" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6161 (class 2606 OID 323196)
-- Name: Subscription Subscription_stripeSubscriptionId_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key129" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6163 (class 2606 OID 322922)
-- Name: Subscription Subscription_stripeSubscriptionId_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key13" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6165 (class 2606 OID 323222)
-- Name: Subscription Subscription_stripeSubscriptionId_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key130" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6167 (class 2606 OID 323198)
-- Name: Subscription Subscription_stripeSubscriptionId_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key131" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6169 (class 2606 OID 323200)
-- Name: Subscription Subscription_stripeSubscriptionId_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key132" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6171 (class 2606 OID 323220)
-- Name: Subscription Subscription_stripeSubscriptionId_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key133" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6173 (class 2606 OID 322960)
-- Name: Subscription Subscription_stripeSubscriptionId_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key134" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6175 (class 2606 OID 322962)
-- Name: Subscription Subscription_stripeSubscriptionId_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key135" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6177 (class 2606 OID 323218)
-- Name: Subscription Subscription_stripeSubscriptionId_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key136" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6179 (class 2606 OID 323216)
-- Name: Subscription Subscription_stripeSubscriptionId_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key137" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6181 (class 2606 OID 323142)
-- Name: Subscription Subscription_stripeSubscriptionId_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key138" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6183 (class 2606 OID 323144)
-- Name: Subscription Subscription_stripeSubscriptionId_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key139" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6185 (class 2606 OID 322924)
-- Name: Subscription Subscription_stripeSubscriptionId_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key14" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6187 (class 2606 OID 323154)
-- Name: Subscription Subscription_stripeSubscriptionId_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key140" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6189 (class 2606 OID 323146)
-- Name: Subscription Subscription_stripeSubscriptionId_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key141" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6191 (class 2606 OID 323148)
-- Name: Subscription Subscription_stripeSubscriptionId_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key142" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6193 (class 2606 OID 323152)
-- Name: Subscription Subscription_stripeSubscriptionId_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key143" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6195 (class 2606 OID 323150)
-- Name: Subscription Subscription_stripeSubscriptionId_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key144" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6197 (class 2606 OID 322958)
-- Name: Subscription Subscription_stripeSubscriptionId_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key145" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6199 (class 2606 OID 322954)
-- Name: Subscription Subscription_stripeSubscriptionId_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key146" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6201 (class 2606 OID 322956)
-- Name: Subscription Subscription_stripeSubscriptionId_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key147" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6203 (class 2606 OID 323140)
-- Name: Subscription Subscription_stripeSubscriptionId_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key148" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6205 (class 2606 OID 323202)
-- Name: Subscription Subscription_stripeSubscriptionId_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key149" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6207 (class 2606 OID 322926)
-- Name: Subscription Subscription_stripeSubscriptionId_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key15" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6209 (class 2606 OID 322952)
-- Name: Subscription Subscription_stripeSubscriptionId_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key150" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6211 (class 2606 OID 323204)
-- Name: Subscription Subscription_stripeSubscriptionId_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key151" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6213 (class 2606 OID 323224)
-- Name: Subscription Subscription_stripeSubscriptionId_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key152" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6215 (class 2606 OID 323206)
-- Name: Subscription Subscription_stripeSubscriptionId_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key153" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6217 (class 2606 OID 323208)
-- Name: Subscription Subscription_stripeSubscriptionId_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key154" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6219 (class 2606 OID 323214)
-- Name: Subscription Subscription_stripeSubscriptionId_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key155" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6221 (class 2606 OID 323210)
-- Name: Subscription Subscription_stripeSubscriptionId_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key156" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6223 (class 2606 OID 323212)
-- Name: Subscription Subscription_stripeSubscriptionId_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key157" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6225 (class 2606 OID 323170)
-- Name: Subscription Subscription_stripeSubscriptionId_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key158" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6227 (class 2606 OID 323108)
-- Name: Subscription Subscription_stripeSubscriptionId_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key159" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6229 (class 2606 OID 322928)
-- Name: Subscription Subscription_stripeSubscriptionId_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key16" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6231 (class 2606 OID 323084)
-- Name: Subscription Subscription_stripeSubscriptionId_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key160" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6233 (class 2606 OID 323106)
-- Name: Subscription Subscription_stripeSubscriptionId_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key161" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6235 (class 2606 OID 323086)
-- Name: Subscription Subscription_stripeSubscriptionId_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key162" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6237 (class 2606 OID 323104)
-- Name: Subscription Subscription_stripeSubscriptionId_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key163" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6239 (class 2606 OID 323088)
-- Name: Subscription Subscription_stripeSubscriptionId_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key164" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6241 (class 2606 OID 323090)
-- Name: Subscription Subscription_stripeSubscriptionId_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key165" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6243 (class 2606 OID 323102)
-- Name: Subscription Subscription_stripeSubscriptionId_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key166" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6245 (class 2606 OID 323092)
-- Name: Subscription Subscription_stripeSubscriptionId_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key167" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6247 (class 2606 OID 323100)
-- Name: Subscription Subscription_stripeSubscriptionId_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key168" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6249 (class 2606 OID 323094)
-- Name: Subscription Subscription_stripeSubscriptionId_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key169" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6251 (class 2606 OID 322930)
-- Name: Subscription Subscription_stripeSubscriptionId_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key17" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6253 (class 2606 OID 323098)
-- Name: Subscription Subscription_stripeSubscriptionId_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key170" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6255 (class 2606 OID 323096)
-- Name: Subscription Subscription_stripeSubscriptionId_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key171" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6257 (class 2606 OID 323226)
-- Name: Subscription Subscription_stripeSubscriptionId_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key172" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6259 (class 2606 OID 322880)
-- Name: Subscription Subscription_stripeSubscriptionId_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key173" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6261 (class 2606 OID 323228)
-- Name: Subscription Subscription_stripeSubscriptionId_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key174" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6263 (class 2606 OID 323230)
-- Name: Subscription Subscription_stripeSubscriptionId_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key175" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6265 (class 2606 OID 322878)
-- Name: Subscription Subscription_stripeSubscriptionId_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key176" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6267 (class 2606 OID 323232)
-- Name: Subscription Subscription_stripeSubscriptionId_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key177" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6269 (class 2606 OID 322876)
-- Name: Subscription Subscription_stripeSubscriptionId_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key178" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6271 (class 2606 OID 323234)
-- Name: Subscription Subscription_stripeSubscriptionId_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key179" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6273 (class 2606 OID 322932)
-- Name: Subscription Subscription_stripeSubscriptionId_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key18" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6275 (class 2606 OID 323236)
-- Name: Subscription Subscription_stripeSubscriptionId_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key180" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6277 (class 2606 OID 322874)
-- Name: Subscription Subscription_stripeSubscriptionId_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key181" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6279 (class 2606 OID 322934)
-- Name: Subscription Subscription_stripeSubscriptionId_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key19" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6281 (class 2606 OID 322936)
-- Name: Subscription Subscription_stripeSubscriptionId_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key2" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6283 (class 2606 OID 322938)
-- Name: Subscription Subscription_stripeSubscriptionId_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key20" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6285 (class 2606 OID 322940)
-- Name: Subscription Subscription_stripeSubscriptionId_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key21" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6287 (class 2606 OID 322942)
-- Name: Subscription Subscription_stripeSubscriptionId_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key22" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6289 (class 2606 OID 322944)
-- Name: Subscription Subscription_stripeSubscriptionId_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key23" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6291 (class 2606 OID 322946)
-- Name: Subscription Subscription_stripeSubscriptionId_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key24" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6293 (class 2606 OID 322948)
-- Name: Subscription Subscription_stripeSubscriptionId_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key25" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6295 (class 2606 OID 322950)
-- Name: Subscription Subscription_stripeSubscriptionId_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key26" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6297 (class 2606 OID 322964)
-- Name: Subscription Subscription_stripeSubscriptionId_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key27" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6299 (class 2606 OID 322966)
-- Name: Subscription Subscription_stripeSubscriptionId_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key28" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6301 (class 2606 OID 322968)
-- Name: Subscription Subscription_stripeSubscriptionId_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key29" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6303 (class 2606 OID 322970)
-- Name: Subscription Subscription_stripeSubscriptionId_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key3" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6305 (class 2606 OID 322972)
-- Name: Subscription Subscription_stripeSubscriptionId_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key30" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6307 (class 2606 OID 322974)
-- Name: Subscription Subscription_stripeSubscriptionId_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key31" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6309 (class 2606 OID 322976)
-- Name: Subscription Subscription_stripeSubscriptionId_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key32" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6311 (class 2606 OID 322978)
-- Name: Subscription Subscription_stripeSubscriptionId_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key33" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6313 (class 2606 OID 322980)
-- Name: Subscription Subscription_stripeSubscriptionId_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key34" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6315 (class 2606 OID 322982)
-- Name: Subscription Subscription_stripeSubscriptionId_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key35" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6317 (class 2606 OID 322984)
-- Name: Subscription Subscription_stripeSubscriptionId_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key36" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6319 (class 2606 OID 322986)
-- Name: Subscription Subscription_stripeSubscriptionId_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key37" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6321 (class 2606 OID 322988)
-- Name: Subscription Subscription_stripeSubscriptionId_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key38" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6323 (class 2606 OID 322990)
-- Name: Subscription Subscription_stripeSubscriptionId_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key39" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6325 (class 2606 OID 322992)
-- Name: Subscription Subscription_stripeSubscriptionId_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key4" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6327 (class 2606 OID 322994)
-- Name: Subscription Subscription_stripeSubscriptionId_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key40" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6329 (class 2606 OID 322996)
-- Name: Subscription Subscription_stripeSubscriptionId_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key41" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6331 (class 2606 OID 322998)
-- Name: Subscription Subscription_stripeSubscriptionId_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key42" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6333 (class 2606 OID 323000)
-- Name: Subscription Subscription_stripeSubscriptionId_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key43" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6335 (class 2606 OID 323002)
-- Name: Subscription Subscription_stripeSubscriptionId_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key44" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6337 (class 2606 OID 323004)
-- Name: Subscription Subscription_stripeSubscriptionId_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key45" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6339 (class 2606 OID 323006)
-- Name: Subscription Subscription_stripeSubscriptionId_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key46" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6341 (class 2606 OID 323008)
-- Name: Subscription Subscription_stripeSubscriptionId_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key47" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6343 (class 2606 OID 323010)
-- Name: Subscription Subscription_stripeSubscriptionId_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key48" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6345 (class 2606 OID 323012)
-- Name: Subscription Subscription_stripeSubscriptionId_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key49" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6347 (class 2606 OID 323014)
-- Name: Subscription Subscription_stripeSubscriptionId_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key5" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6349 (class 2606 OID 323016)
-- Name: Subscription Subscription_stripeSubscriptionId_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key50" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6351 (class 2606 OID 323018)
-- Name: Subscription Subscription_stripeSubscriptionId_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key51" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6353 (class 2606 OID 323020)
-- Name: Subscription Subscription_stripeSubscriptionId_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key52" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6355 (class 2606 OID 323022)
-- Name: Subscription Subscription_stripeSubscriptionId_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key53" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6357 (class 2606 OID 323024)
-- Name: Subscription Subscription_stripeSubscriptionId_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key54" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6359 (class 2606 OID 323026)
-- Name: Subscription Subscription_stripeSubscriptionId_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key55" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6361 (class 2606 OID 323028)
-- Name: Subscription Subscription_stripeSubscriptionId_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key56" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6363 (class 2606 OID 323030)
-- Name: Subscription Subscription_stripeSubscriptionId_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key57" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6365 (class 2606 OID 323032)
-- Name: Subscription Subscription_stripeSubscriptionId_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key58" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6367 (class 2606 OID 323034)
-- Name: Subscription Subscription_stripeSubscriptionId_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key59" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6369 (class 2606 OID 323036)
-- Name: Subscription Subscription_stripeSubscriptionId_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key6" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6371 (class 2606 OID 323038)
-- Name: Subscription Subscription_stripeSubscriptionId_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key60" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6373 (class 2606 OID 323040)
-- Name: Subscription Subscription_stripeSubscriptionId_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key61" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6375 (class 2606 OID 323042)
-- Name: Subscription Subscription_stripeSubscriptionId_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key62" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6377 (class 2606 OID 323044)
-- Name: Subscription Subscription_stripeSubscriptionId_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key63" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6379 (class 2606 OID 323046)
-- Name: Subscription Subscription_stripeSubscriptionId_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key64" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6381 (class 2606 OID 323048)
-- Name: Subscription Subscription_stripeSubscriptionId_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key65" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6383 (class 2606 OID 323050)
-- Name: Subscription Subscription_stripeSubscriptionId_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key66" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6385 (class 2606 OID 323052)
-- Name: Subscription Subscription_stripeSubscriptionId_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key67" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6387 (class 2606 OID 323054)
-- Name: Subscription Subscription_stripeSubscriptionId_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key68" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6389 (class 2606 OID 323056)
-- Name: Subscription Subscription_stripeSubscriptionId_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key69" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6391 (class 2606 OID 323058)
-- Name: Subscription Subscription_stripeSubscriptionId_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key7" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6393 (class 2606 OID 323060)
-- Name: Subscription Subscription_stripeSubscriptionId_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key70" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6395 (class 2606 OID 323062)
-- Name: Subscription Subscription_stripeSubscriptionId_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key71" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6397 (class 2606 OID 323064)
-- Name: Subscription Subscription_stripeSubscriptionId_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key72" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6399 (class 2606 OID 323066)
-- Name: Subscription Subscription_stripeSubscriptionId_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key73" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6401 (class 2606 OID 323068)
-- Name: Subscription Subscription_stripeSubscriptionId_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key74" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6403 (class 2606 OID 323070)
-- Name: Subscription Subscription_stripeSubscriptionId_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key75" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6405 (class 2606 OID 323072)
-- Name: Subscription Subscription_stripeSubscriptionId_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key76" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6407 (class 2606 OID 323074)
-- Name: Subscription Subscription_stripeSubscriptionId_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key77" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6409 (class 2606 OID 323076)
-- Name: Subscription Subscription_stripeSubscriptionId_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key78" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6411 (class 2606 OID 323078)
-- Name: Subscription Subscription_stripeSubscriptionId_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key79" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6413 (class 2606 OID 323080)
-- Name: Subscription Subscription_stripeSubscriptionId_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key8" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6415 (class 2606 OID 323082)
-- Name: Subscription Subscription_stripeSubscriptionId_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key80" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6417 (class 2606 OID 323110)
-- Name: Subscription Subscription_stripeSubscriptionId_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key81" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6419 (class 2606 OID 323112)
-- Name: Subscription Subscription_stripeSubscriptionId_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key82" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6421 (class 2606 OID 323114)
-- Name: Subscription Subscription_stripeSubscriptionId_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key83" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6423 (class 2606 OID 323116)
-- Name: Subscription Subscription_stripeSubscriptionId_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key84" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6425 (class 2606 OID 323118)
-- Name: Subscription Subscription_stripeSubscriptionId_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key85" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6427 (class 2606 OID 323120)
-- Name: Subscription Subscription_stripeSubscriptionId_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key86" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6429 (class 2606 OID 323122)
-- Name: Subscription Subscription_stripeSubscriptionId_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key87" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6431 (class 2606 OID 323124)
-- Name: Subscription Subscription_stripeSubscriptionId_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key88" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6433 (class 2606 OID 323126)
-- Name: Subscription Subscription_stripeSubscriptionId_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key89" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6435 (class 2606 OID 323128)
-- Name: Subscription Subscription_stripeSubscriptionId_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key9" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6437 (class 2606 OID 323130)
-- Name: Subscription Subscription_stripeSubscriptionId_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key90" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6439 (class 2606 OID 323132)
-- Name: Subscription Subscription_stripeSubscriptionId_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key91" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6441 (class 2606 OID 323134)
-- Name: Subscription Subscription_stripeSubscriptionId_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key92" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6443 (class 2606 OID 323136)
-- Name: Subscription Subscription_stripeSubscriptionId_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key93" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6445 (class 2606 OID 322910)
-- Name: Subscription Subscription_stripeSubscriptionId_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key94" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6447 (class 2606 OID 323138)
-- Name: Subscription Subscription_stripeSubscriptionId_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key95" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6449 (class 2606 OID 323156)
-- Name: Subscription Subscription_stripeSubscriptionId_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key96" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6451 (class 2606 OID 322908)
-- Name: Subscription Subscription_stripeSubscriptionId_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key97" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6453 (class 2606 OID 323158)
-- Name: Subscription Subscription_stripeSubscriptionId_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key98" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6455 (class 2606 OID 322906)
-- Name: Subscription Subscription_stripeSubscriptionId_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_stripeSubscriptionId_key99" UNIQUE ("stripeSubscriptionId");


--
-- TOC entry 6460 (class 2606 OID 52460)
-- Name: TenantProductForms TenantProductForms_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProductForms"
    ADD CONSTRAINT "TenantProductForms_pkey" PRIMARY KEY (id);


--
-- TOC entry 6457 (class 2606 OID 52462)
-- Name: TenantProduct TenantProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProduct"
    ADD CONSTRAINT "TenantProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 6464 (class 2606 OID 52464)
-- Name: TreatmentPlan TreatmentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentPlan"
    ADD CONSTRAINT "TreatmentPlan_pkey" PRIMARY KEY (id);


--
-- TOC entry 6466 (class 2606 OID 52466)
-- Name: TreatmentProducts TreatmentProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_pkey" PRIMARY KEY (id);


--
-- TOC entry 6468 (class 2606 OID 52468)
-- Name: TreatmentProducts TreatmentProducts_productId_treatmentId_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_productId_treatmentId_key" UNIQUE ("productId", "treatmentId");


--
-- TOC entry 6462 (class 2606 OID 52470)
-- Name: Treatment Treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_pkey" PRIMARY KEY (id);


--
-- TOC entry 6470 (class 2606 OID 52472)
-- Name: UserPatient UserPatient_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."UserPatient"
    ADD CONSTRAINT "UserPatient_pkey" PRIMARY KEY ("userId", "pharmacyProvider");


--
-- TOC entry 6473 (class 2606 OID 52474)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 6475 (class 2606 OID 320668)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 6477 (class 2606 OID 320670)
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- TOC entry 6479 (class 2606 OID 320672)
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- TOC entry 6481 (class 2606 OID 320674)
-- Name: users users_email_key100; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key100 UNIQUE (email);


--
-- TOC entry 6483 (class 2606 OID 320676)
-- Name: users users_email_key101; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key101 UNIQUE (email);


--
-- TOC entry 6485 (class 2606 OID 320678)
-- Name: users users_email_key102; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key102 UNIQUE (email);


--
-- TOC entry 6487 (class 2606 OID 320680)
-- Name: users users_email_key103; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key103 UNIQUE (email);


--
-- TOC entry 6489 (class 2606 OID 320682)
-- Name: users users_email_key104; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key104 UNIQUE (email);


--
-- TOC entry 6491 (class 2606 OID 320684)
-- Name: users users_email_key105; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key105 UNIQUE (email);


--
-- TOC entry 6493 (class 2606 OID 320686)
-- Name: users users_email_key106; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key106 UNIQUE (email);


--
-- TOC entry 6495 (class 2606 OID 320688)
-- Name: users users_email_key107; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key107 UNIQUE (email);


--
-- TOC entry 6497 (class 2606 OID 320690)
-- Name: users users_email_key108; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key108 UNIQUE (email);


--
-- TOC entry 6499 (class 2606 OID 320692)
-- Name: users users_email_key109; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key109 UNIQUE (email);


--
-- TOC entry 6501 (class 2606 OID 320694)
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- TOC entry 6503 (class 2606 OID 320696)
-- Name: users users_email_key110; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key110 UNIQUE (email);


--
-- TOC entry 6505 (class 2606 OID 320698)
-- Name: users users_email_key111; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key111 UNIQUE (email);


--
-- TOC entry 6507 (class 2606 OID 320700)
-- Name: users users_email_key112; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key112 UNIQUE (email);


--
-- TOC entry 6509 (class 2606 OID 320702)
-- Name: users users_email_key113; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key113 UNIQUE (email);


--
-- TOC entry 6511 (class 2606 OID 320704)
-- Name: users users_email_key114; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key114 UNIQUE (email);


--
-- TOC entry 6513 (class 2606 OID 320706)
-- Name: users users_email_key115; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key115 UNIQUE (email);


--
-- TOC entry 6515 (class 2606 OID 320708)
-- Name: users users_email_key116; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key116 UNIQUE (email);


--
-- TOC entry 6517 (class 2606 OID 320710)
-- Name: users users_email_key117; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key117 UNIQUE (email);


--
-- TOC entry 6519 (class 2606 OID 320712)
-- Name: users users_email_key118; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key118 UNIQUE (email);


--
-- TOC entry 6521 (class 2606 OID 320714)
-- Name: users users_email_key119; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key119 UNIQUE (email);


--
-- TOC entry 6523 (class 2606 OID 320716)
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- TOC entry 6525 (class 2606 OID 320718)
-- Name: users users_email_key120; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key120 UNIQUE (email);


--
-- TOC entry 6527 (class 2606 OID 320720)
-- Name: users users_email_key121; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key121 UNIQUE (email);


--
-- TOC entry 6529 (class 2606 OID 320722)
-- Name: users users_email_key122; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key122 UNIQUE (email);


--
-- TOC entry 6531 (class 2606 OID 320724)
-- Name: users users_email_key123; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key123 UNIQUE (email);


--
-- TOC entry 6533 (class 2606 OID 320726)
-- Name: users users_email_key124; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key124 UNIQUE (email);


--
-- TOC entry 6535 (class 2606 OID 320728)
-- Name: users users_email_key125; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key125 UNIQUE (email);


--
-- TOC entry 6537 (class 2606 OID 320730)
-- Name: users users_email_key126; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key126 UNIQUE (email);


--
-- TOC entry 6539 (class 2606 OID 320732)
-- Name: users users_email_key127; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key127 UNIQUE (email);


--
-- TOC entry 6541 (class 2606 OID 320734)
-- Name: users users_email_key128; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key128 UNIQUE (email);


--
-- TOC entry 6543 (class 2606 OID 320736)
-- Name: users users_email_key129; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key129 UNIQUE (email);


--
-- TOC entry 6545 (class 2606 OID 320738)
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- TOC entry 6547 (class 2606 OID 320740)
-- Name: users users_email_key130; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key130 UNIQUE (email);


--
-- TOC entry 6549 (class 2606 OID 320742)
-- Name: users users_email_key131; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key131 UNIQUE (email);


--
-- TOC entry 6551 (class 2606 OID 320744)
-- Name: users users_email_key132; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key132 UNIQUE (email);


--
-- TOC entry 6553 (class 2606 OID 320746)
-- Name: users users_email_key133; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key133 UNIQUE (email);


--
-- TOC entry 6555 (class 2606 OID 320748)
-- Name: users users_email_key134; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key134 UNIQUE (email);


--
-- TOC entry 6557 (class 2606 OID 320750)
-- Name: users users_email_key135; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key135 UNIQUE (email);


--
-- TOC entry 6559 (class 2606 OID 320752)
-- Name: users users_email_key136; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key136 UNIQUE (email);


--
-- TOC entry 6561 (class 2606 OID 320754)
-- Name: users users_email_key137; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key137 UNIQUE (email);


--
-- TOC entry 6563 (class 2606 OID 320756)
-- Name: users users_email_key138; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key138 UNIQUE (email);


--
-- TOC entry 6565 (class 2606 OID 320758)
-- Name: users users_email_key139; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key139 UNIQUE (email);


--
-- TOC entry 6567 (class 2606 OID 320760)
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- TOC entry 6569 (class 2606 OID 320762)
-- Name: users users_email_key140; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key140 UNIQUE (email);


--
-- TOC entry 6571 (class 2606 OID 320764)
-- Name: users users_email_key141; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key141 UNIQUE (email);


--
-- TOC entry 6573 (class 2606 OID 320766)
-- Name: users users_email_key142; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key142 UNIQUE (email);


--
-- TOC entry 6575 (class 2606 OID 320768)
-- Name: users users_email_key143; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key143 UNIQUE (email);


--
-- TOC entry 6577 (class 2606 OID 320770)
-- Name: users users_email_key144; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key144 UNIQUE (email);


--
-- TOC entry 6579 (class 2606 OID 320772)
-- Name: users users_email_key145; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key145 UNIQUE (email);


--
-- TOC entry 6581 (class 2606 OID 320774)
-- Name: users users_email_key146; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key146 UNIQUE (email);


--
-- TOC entry 6583 (class 2606 OID 320548)
-- Name: users users_email_key147; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key147 UNIQUE (email);


--
-- TOC entry 6585 (class 2606 OID 320550)
-- Name: users users_email_key148; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key148 UNIQUE (email);


--
-- TOC entry 6587 (class 2606 OID 320552)
-- Name: users users_email_key149; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key149 UNIQUE (email);


--
-- TOC entry 6589 (class 2606 OID 320554)
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- TOC entry 6591 (class 2606 OID 320556)
-- Name: users users_email_key150; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key150 UNIQUE (email);


--
-- TOC entry 6593 (class 2606 OID 320558)
-- Name: users users_email_key151; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key151 UNIQUE (email);


--
-- TOC entry 6595 (class 2606 OID 320560)
-- Name: users users_email_key152; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key152 UNIQUE (email);


--
-- TOC entry 6597 (class 2606 OID 320562)
-- Name: users users_email_key153; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key153 UNIQUE (email);


--
-- TOC entry 6599 (class 2606 OID 320564)
-- Name: users users_email_key154; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key154 UNIQUE (email);


--
-- TOC entry 6601 (class 2606 OID 320448)
-- Name: users users_email_key155; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key155 UNIQUE (email);


--
-- TOC entry 6603 (class 2606 OID 320450)
-- Name: users users_email_key156; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key156 UNIQUE (email);


--
-- TOC entry 6605 (class 2606 OID 320452)
-- Name: users users_email_key157; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key157 UNIQUE (email);


--
-- TOC entry 6607 (class 2606 OID 320454)
-- Name: users users_email_key158; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key158 UNIQUE (email);


--
-- TOC entry 6609 (class 2606 OID 320456)
-- Name: users users_email_key159; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key159 UNIQUE (email);


--
-- TOC entry 6611 (class 2606 OID 320458)
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- TOC entry 6613 (class 2606 OID 320460)
-- Name: users users_email_key160; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key160 UNIQUE (email);


--
-- TOC entry 6615 (class 2606 OID 320462)
-- Name: users users_email_key161; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key161 UNIQUE (email);


--
-- TOC entry 6617 (class 2606 OID 320464)
-- Name: users users_email_key162; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key162 UNIQUE (email);


--
-- TOC entry 6619 (class 2606 OID 320466)
-- Name: users users_email_key163; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key163 UNIQUE (email);


--
-- TOC entry 6621 (class 2606 OID 320468)
-- Name: users users_email_key164; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key164 UNIQUE (email);


--
-- TOC entry 6623 (class 2606 OID 320470)
-- Name: users users_email_key165; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key165 UNIQUE (email);


--
-- TOC entry 6625 (class 2606 OID 320472)
-- Name: users users_email_key166; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key166 UNIQUE (email);


--
-- TOC entry 6627 (class 2606 OID 320474)
-- Name: users users_email_key167; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key167 UNIQUE (email);


--
-- TOC entry 6629 (class 2606 OID 320476)
-- Name: users users_email_key168; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key168 UNIQUE (email);


--
-- TOC entry 6631 (class 2606 OID 320478)
-- Name: users users_email_key169; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key169 UNIQUE (email);


--
-- TOC entry 6633 (class 2606 OID 320480)
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- TOC entry 6635 (class 2606 OID 320482)
-- Name: users users_email_key170; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key170 UNIQUE (email);


--
-- TOC entry 6637 (class 2606 OID 320484)
-- Name: users users_email_key171; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key171 UNIQUE (email);


--
-- TOC entry 6639 (class 2606 OID 320378)
-- Name: users users_email_key172; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key172 UNIQUE (email);


--
-- TOC entry 6641 (class 2606 OID 320380)
-- Name: users users_email_key173; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key173 UNIQUE (email);


--
-- TOC entry 6643 (class 2606 OID 320382)
-- Name: users users_email_key174; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key174 UNIQUE (email);


--
-- TOC entry 6645 (class 2606 OID 320384)
-- Name: users users_email_key175; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key175 UNIQUE (email);


--
-- TOC entry 6647 (class 2606 OID 320386)
-- Name: users users_email_key176; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key176 UNIQUE (email);


--
-- TOC entry 6649 (class 2606 OID 320388)
-- Name: users users_email_key177; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key177 UNIQUE (email);


--
-- TOC entry 6651 (class 2606 OID 320390)
-- Name: users users_email_key178; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key178 UNIQUE (email);


--
-- TOC entry 6653 (class 2606 OID 320392)
-- Name: users users_email_key179; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key179 UNIQUE (email);


--
-- TOC entry 6655 (class 2606 OID 320394)
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- TOC entry 6657 (class 2606 OID 320396)
-- Name: users users_email_key180; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key180 UNIQUE (email);


--
-- TOC entry 6659 (class 2606 OID 320398)
-- Name: users users_email_key181; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key181 UNIQUE (email);


--
-- TOC entry 6661 (class 2606 OID 320400)
-- Name: users users_email_key182; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key182 UNIQUE (email);


--
-- TOC entry 6663 (class 2606 OID 320402)
-- Name: users users_email_key183; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key183 UNIQUE (email);


--
-- TOC entry 6665 (class 2606 OID 320566)
-- Name: users users_email_key184; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key184 UNIQUE (email);


--
-- TOC entry 6667 (class 2606 OID 320568)
-- Name: users users_email_key185; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key185 UNIQUE (email);


--
-- TOC entry 6669 (class 2606 OID 320570)
-- Name: users users_email_key186; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key186 UNIQUE (email);


--
-- TOC entry 6671 (class 2606 OID 320572)
-- Name: users users_email_key187; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key187 UNIQUE (email);


--
-- TOC entry 6673 (class 2606 OID 320574)
-- Name: users users_email_key188; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key188 UNIQUE (email);


--
-- TOC entry 6675 (class 2606 OID 320576)
-- Name: users users_email_key189; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key189 UNIQUE (email);


--
-- TOC entry 6677 (class 2606 OID 320578)
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- TOC entry 6679 (class 2606 OID 320580)
-- Name: users users_email_key190; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key190 UNIQUE (email);


--
-- TOC entry 6681 (class 2606 OID 320582)
-- Name: users users_email_key191; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key191 UNIQUE (email);


--
-- TOC entry 6683 (class 2606 OID 320584)
-- Name: users users_email_key192; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key192 UNIQUE (email);


--
-- TOC entry 6685 (class 2606 OID 320586)
-- Name: users users_email_key193; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key193 UNIQUE (email);


--
-- TOC entry 6687 (class 2606 OID 320588)
-- Name: users users_email_key194; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key194 UNIQUE (email);


--
-- TOC entry 6689 (class 2606 OID 320590)
-- Name: users users_email_key195; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key195 UNIQUE (email);


--
-- TOC entry 6691 (class 2606 OID 320592)
-- Name: users users_email_key196; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key196 UNIQUE (email);


--
-- TOC entry 6693 (class 2606 OID 320594)
-- Name: users users_email_key197; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key197 UNIQUE (email);


--
-- TOC entry 6695 (class 2606 OID 320596)
-- Name: users users_email_key198; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key198 UNIQUE (email);


--
-- TOC entry 6697 (class 2606 OID 320598)
-- Name: users users_email_key199; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key199 UNIQUE (email);


--
-- TOC entry 6699 (class 2606 OID 320600)
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- TOC entry 6701 (class 2606 OID 320602)
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- TOC entry 6703 (class 2606 OID 320604)
-- Name: users users_email_key200; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key200 UNIQUE (email);


--
-- TOC entry 6705 (class 2606 OID 320606)
-- Name: users users_email_key201; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key201 UNIQUE (email);


--
-- TOC entry 6707 (class 2606 OID 320608)
-- Name: users users_email_key202; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key202 UNIQUE (email);


--
-- TOC entry 6709 (class 2606 OID 320610)
-- Name: users users_email_key203; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key203 UNIQUE (email);


--
-- TOC entry 6711 (class 2606 OID 320612)
-- Name: users users_email_key204; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key204 UNIQUE (email);


--
-- TOC entry 6713 (class 2606 OID 320614)
-- Name: users users_email_key205; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key205 UNIQUE (email);


--
-- TOC entry 6715 (class 2606 OID 320616)
-- Name: users users_email_key206; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key206 UNIQUE (email);


--
-- TOC entry 6717 (class 2606 OID 320618)
-- Name: users users_email_key207; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key207 UNIQUE (email);


--
-- TOC entry 6719 (class 2606 OID 320620)
-- Name: users users_email_key208; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key208 UNIQUE (email);


--
-- TOC entry 6721 (class 2606 OID 320622)
-- Name: users users_email_key209; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key209 UNIQUE (email);


--
-- TOC entry 6723 (class 2606 OID 320624)
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- TOC entry 6725 (class 2606 OID 320626)
-- Name: users users_email_key210; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key210 UNIQUE (email);


--
-- TOC entry 6727 (class 2606 OID 320628)
-- Name: users users_email_key211; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key211 UNIQUE (email);


--
-- TOC entry 6729 (class 2606 OID 320630)
-- Name: users users_email_key212; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key212 UNIQUE (email);


--
-- TOC entry 6731 (class 2606 OID 320632)
-- Name: users users_email_key213; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key213 UNIQUE (email);


--
-- TOC entry 6733 (class 2606 OID 320634)
-- Name: users users_email_key214; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key214 UNIQUE (email);


--
-- TOC entry 6735 (class 2606 OID 320636)
-- Name: users users_email_key215; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key215 UNIQUE (email);


--
-- TOC entry 6737 (class 2606 OID 320638)
-- Name: users users_email_key216; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key216 UNIQUE (email);


--
-- TOC entry 6739 (class 2606 OID 320640)
-- Name: users users_email_key217; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key217 UNIQUE (email);


--
-- TOC entry 6741 (class 2606 OID 320412)
-- Name: users users_email_key218; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key218 UNIQUE (email);


--
-- TOC entry 6743 (class 2606 OID 320414)
-- Name: users users_email_key219; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key219 UNIQUE (email);


--
-- TOC entry 6745 (class 2606 OID 320416)
-- Name: users users_email_key22; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key22 UNIQUE (email);


--
-- TOC entry 6747 (class 2606 OID 320418)
-- Name: users users_email_key220; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key220 UNIQUE (email);


--
-- TOC entry 6749 (class 2606 OID 320420)
-- Name: users users_email_key221; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key221 UNIQUE (email);


--
-- TOC entry 6751 (class 2606 OID 320422)
-- Name: users users_email_key222; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key222 UNIQUE (email);


--
-- TOC entry 6753 (class 2606 OID 320424)
-- Name: users users_email_key223; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key223 UNIQUE (email);


--
-- TOC entry 6755 (class 2606 OID 320426)
-- Name: users users_email_key224; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key224 UNIQUE (email);


--
-- TOC entry 6757 (class 2606 OID 320428)
-- Name: users users_email_key225; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key225 UNIQUE (email);


--
-- TOC entry 6759 (class 2606 OID 320430)
-- Name: users users_email_key226; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key226 UNIQUE (email);


--
-- TOC entry 6761 (class 2606 OID 320432)
-- Name: users users_email_key227; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key227 UNIQUE (email);


--
-- TOC entry 6763 (class 2606 OID 320434)
-- Name: users users_email_key228; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key228 UNIQUE (email);


--
-- TOC entry 6765 (class 2606 OID 320436)
-- Name: users users_email_key229; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key229 UNIQUE (email);


--
-- TOC entry 6767 (class 2606 OID 320438)
-- Name: users users_email_key23; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key23 UNIQUE (email);


--
-- TOC entry 6769 (class 2606 OID 320440)
-- Name: users users_email_key230; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key230 UNIQUE (email);


--
-- TOC entry 6771 (class 2606 OID 320486)
-- Name: users users_email_key231; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key231 UNIQUE (email);


--
-- TOC entry 6773 (class 2606 OID 320488)
-- Name: users users_email_key232; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key232 UNIQUE (email);


--
-- TOC entry 6775 (class 2606 OID 320490)
-- Name: users users_email_key233; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key233 UNIQUE (email);


--
-- TOC entry 6777 (class 2606 OID 320492)
-- Name: users users_email_key234; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key234 UNIQUE (email);


--
-- TOC entry 6779 (class 2606 OID 320882)
-- Name: users users_email_key235; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key235 UNIQUE (email);


--
-- TOC entry 6781 (class 2606 OID 320666)
-- Name: users users_email_key236; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key236 UNIQUE (email);


--
-- TOC entry 6783 (class 2606 OID 320884)
-- Name: users users_email_key237; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key237 UNIQUE (email);


--
-- TOC entry 6785 (class 2606 OID 320886)
-- Name: users users_email_key238; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key238 UNIQUE (email);


--
-- TOC entry 6787 (class 2606 OID 320664)
-- Name: users users_email_key239; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key239 UNIQUE (email);


--
-- TOC entry 6789 (class 2606 OID 320494)
-- Name: users users_email_key24; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key24 UNIQUE (email);


--
-- TOC entry 6791 (class 2606 OID 320888)
-- Name: users users_email_key240; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key240 UNIQUE (email);


--
-- TOC entry 6793 (class 2606 OID 320662)
-- Name: users users_email_key241; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key241 UNIQUE (email);


--
-- TOC entry 6795 (class 2606 OID 320890)
-- Name: users users_email_key242; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key242 UNIQUE (email);


--
-- TOC entry 6797 (class 2606 OID 320660)
-- Name: users users_email_key243; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key243 UNIQUE (email);


--
-- TOC entry 6799 (class 2606 OID 320892)
-- Name: users users_email_key244; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key244 UNIQUE (email);


--
-- TOC entry 6801 (class 2606 OID 320894)
-- Name: users users_email_key245; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key245 UNIQUE (email);


--
-- TOC entry 6803 (class 2606 OID 320658)
-- Name: users users_email_key246; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key246 UNIQUE (email);


--
-- TOC entry 6805 (class 2606 OID 320896)
-- Name: users users_email_key247; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key247 UNIQUE (email);


--
-- TOC entry 6807 (class 2606 OID 320898)
-- Name: users users_email_key248; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key248 UNIQUE (email);


--
-- TOC entry 6809 (class 2606 OID 320900)
-- Name: users users_email_key249; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key249 UNIQUE (email);


--
-- TOC entry 6811 (class 2606 OID 320496)
-- Name: users users_email_key25; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key25 UNIQUE (email);


--
-- TOC entry 6813 (class 2606 OID 320656)
-- Name: users users_email_key250; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key250 UNIQUE (email);


--
-- TOC entry 6815 (class 2606 OID 320902)
-- Name: users users_email_key251; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key251 UNIQUE (email);


--
-- TOC entry 6817 (class 2606 OID 320904)
-- Name: users users_email_key252; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key252 UNIQUE (email);


--
-- TOC entry 6819 (class 2606 OID 320654)
-- Name: users users_email_key253; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key253 UNIQUE (email);


--
-- TOC entry 6821 (class 2606 OID 320906)
-- Name: users users_email_key254; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key254 UNIQUE (email);


--
-- TOC entry 6823 (class 2606 OID 320908)
-- Name: users users_email_key255; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key255 UNIQUE (email);


--
-- TOC entry 6825 (class 2606 OID 320652)
-- Name: users users_email_key256; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key256 UNIQUE (email);


--
-- TOC entry 6827 (class 2606 OID 320910)
-- Name: users users_email_key257; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key257 UNIQUE (email);


--
-- TOC entry 6829 (class 2606 OID 320650)
-- Name: users users_email_key258; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key258 UNIQUE (email);


--
-- TOC entry 6831 (class 2606 OID 320912)
-- Name: users users_email_key259; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key259 UNIQUE (email);


--
-- TOC entry 6833 (class 2606 OID 320498)
-- Name: users users_email_key26; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key26 UNIQUE (email);


--
-- TOC entry 6835 (class 2606 OID 320914)
-- Name: users users_email_key260; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key260 UNIQUE (email);


--
-- TOC entry 6837 (class 2606 OID 320916)
-- Name: users users_email_key261; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key261 UNIQUE (email);


--
-- TOC entry 6839 (class 2606 OID 320546)
-- Name: users users_email_key262; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key262 UNIQUE (email);


--
-- TOC entry 6841 (class 2606 OID 320918)
-- Name: users users_email_key263; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key263 UNIQUE (email);


--
-- TOC entry 6843 (class 2606 OID 320920)
-- Name: users users_email_key264; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key264 UNIQUE (email);


--
-- TOC entry 6845 (class 2606 OID 320922)
-- Name: users users_email_key265; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key265 UNIQUE (email);


--
-- TOC entry 6847 (class 2606 OID 320410)
-- Name: users users_email_key266; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key266 UNIQUE (email);


--
-- TOC entry 6849 (class 2606 OID 320924)
-- Name: users users_email_key267; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key267 UNIQUE (email);


--
-- TOC entry 6851 (class 2606 OID 320408)
-- Name: users users_email_key268; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key268 UNIQUE (email);


--
-- TOC entry 6853 (class 2606 OID 320926)
-- Name: users users_email_key269; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key269 UNIQUE (email);


--
-- TOC entry 6855 (class 2606 OID 320500)
-- Name: users users_email_key27; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key27 UNIQUE (email);


--
-- TOC entry 6857 (class 2606 OID 320406)
-- Name: users users_email_key270; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key270 UNIQUE (email);


--
-- TOC entry 6859 (class 2606 OID 320928)
-- Name: users users_email_key271; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key271 UNIQUE (email);


--
-- TOC entry 6861 (class 2606 OID 320404)
-- Name: users users_email_key272; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key272 UNIQUE (email);


--
-- TOC entry 6863 (class 2606 OID 320930)
-- Name: users users_email_key273; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key273 UNIQUE (email);


--
-- TOC entry 6865 (class 2606 OID 320932)
-- Name: users users_email_key274; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key274 UNIQUE (email);


--
-- TOC entry 6867 (class 2606 OID 320446)
-- Name: users users_email_key275; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key275 UNIQUE (email);


--
-- TOC entry 6869 (class 2606 OID 320934)
-- Name: users users_email_key276; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key276 UNIQUE (email);


--
-- TOC entry 6871 (class 2606 OID 320444)
-- Name: users users_email_key277; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key277 UNIQUE (email);


--
-- TOC entry 6873 (class 2606 OID 320936)
-- Name: users users_email_key278; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key278 UNIQUE (email);


--
-- TOC entry 6875 (class 2606 OID 320442)
-- Name: users users_email_key279; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key279 UNIQUE (email);


--
-- TOC entry 6877 (class 2606 OID 320502)
-- Name: users users_email_key28; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key28 UNIQUE (email);


--
-- TOC entry 6879 (class 2606 OID 320938)
-- Name: users users_email_key280; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key280 UNIQUE (email);


--
-- TOC entry 6881 (class 2606 OID 320940)
-- Name: users users_email_key281; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key281 UNIQUE (email);


--
-- TOC entry 6883 (class 2606 OID 320376)
-- Name: users users_email_key282; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key282 UNIQUE (email);


--
-- TOC entry 6885 (class 2606 OID 320942)
-- Name: users users_email_key283; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key283 UNIQUE (email);


--
-- TOC entry 6887 (class 2606 OID 320944)
-- Name: users users_email_key284; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key284 UNIQUE (email);


--
-- TOC entry 6889 (class 2606 OID 320374)
-- Name: users users_email_key285; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key285 UNIQUE (email);


--
-- TOC entry 6891 (class 2606 OID 320946)
-- Name: users users_email_key286; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key286 UNIQUE (email);


--
-- TOC entry 6893 (class 2606 OID 320948)
-- Name: users users_email_key287; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key287 UNIQUE (email);


--
-- TOC entry 6895 (class 2606 OID 320950)
-- Name: users users_email_key288; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key288 UNIQUE (email);


--
-- TOC entry 6897 (class 2606 OID 320372)
-- Name: users users_email_key289; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key289 UNIQUE (email);


--
-- TOC entry 6899 (class 2606 OID 320504)
-- Name: users users_email_key29; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key29 UNIQUE (email);


--
-- TOC entry 6901 (class 2606 OID 320952)
-- Name: users users_email_key290; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key290 UNIQUE (email);


--
-- TOC entry 6903 (class 2606 OID 320954)
-- Name: users users_email_key291; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key291 UNIQUE (email);


--
-- TOC entry 6905 (class 2606 OID 320370)
-- Name: users users_email_key292; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key292 UNIQUE (email);


--
-- TOC entry 6907 (class 2606 OID 320956)
-- Name: users users_email_key293; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key293 UNIQUE (email);


--
-- TOC entry 6909 (class 2606 OID 320368)
-- Name: users users_email_key294; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key294 UNIQUE (email);


--
-- TOC entry 6911 (class 2606 OID 320958)
-- Name: users users_email_key295; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key295 UNIQUE (email);


--
-- TOC entry 6913 (class 2606 OID 320366)
-- Name: users users_email_key296; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key296 UNIQUE (email);


--
-- TOC entry 6915 (class 2606 OID 320960)
-- Name: users users_email_key297; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key297 UNIQUE (email);


--
-- TOC entry 6917 (class 2606 OID 320962)
-- Name: users users_email_key298; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key298 UNIQUE (email);


--
-- TOC entry 6919 (class 2606 OID 320364)
-- Name: users users_email_key299; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key299 UNIQUE (email);


--
-- TOC entry 6921 (class 2606 OID 320506)
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- TOC entry 6923 (class 2606 OID 320508)
-- Name: users users_email_key30; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key30 UNIQUE (email);


--
-- TOC entry 6925 (class 2606 OID 320964)
-- Name: users users_email_key300; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key300 UNIQUE (email);


--
-- TOC entry 6927 (class 2606 OID 320362)
-- Name: users users_email_key301; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key301 UNIQUE (email);


--
-- TOC entry 6929 (class 2606 OID 320966)
-- Name: users users_email_key302; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key302 UNIQUE (email);


--
-- TOC entry 6931 (class 2606 OID 320968)
-- Name: users users_email_key303; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key303 UNIQUE (email);


--
-- TOC entry 6933 (class 2606 OID 320360)
-- Name: users users_email_key304; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key304 UNIQUE (email);


--
-- TOC entry 6935 (class 2606 OID 320970)
-- Name: users users_email_key305; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key305 UNIQUE (email);


--
-- TOC entry 6937 (class 2606 OID 320358)
-- Name: users users_email_key306; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key306 UNIQUE (email);


--
-- TOC entry 6939 (class 2606 OID 320972)
-- Name: users users_email_key307; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key307 UNIQUE (email);


--
-- TOC entry 6941 (class 2606 OID 320356)
-- Name: users users_email_key308; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key308 UNIQUE (email);


--
-- TOC entry 6943 (class 2606 OID 320974)
-- Name: users users_email_key309; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key309 UNIQUE (email);


--
-- TOC entry 6945 (class 2606 OID 320510)
-- Name: users users_email_key31; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key31 UNIQUE (email);


--
-- TOC entry 6947 (class 2606 OID 320354)
-- Name: users users_email_key310; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key310 UNIQUE (email);


--
-- TOC entry 6949 (class 2606 OID 320976)
-- Name: users users_email_key311; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key311 UNIQUE (email);


--
-- TOC entry 6951 (class 2606 OID 320352)
-- Name: users users_email_key312; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key312 UNIQUE (email);


--
-- TOC entry 6953 (class 2606 OID 320978)
-- Name: users users_email_key313; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key313 UNIQUE (email);


--
-- TOC entry 6955 (class 2606 OID 320980)
-- Name: users users_email_key314; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key314 UNIQUE (email);


--
-- TOC entry 6957 (class 2606 OID 320350)
-- Name: users users_email_key315; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key315 UNIQUE (email);


--
-- TOC entry 6959 (class 2606 OID 320982)
-- Name: users users_email_key316; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key316 UNIQUE (email);


--
-- TOC entry 6961 (class 2606 OID 320348)
-- Name: users users_email_key317; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key317 UNIQUE (email);


--
-- TOC entry 6963 (class 2606 OID 320984)
-- Name: users users_email_key318; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key318 UNIQUE (email);


--
-- TOC entry 6965 (class 2606 OID 320346)
-- Name: users users_email_key319; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key319 UNIQUE (email);


--
-- TOC entry 6967 (class 2606 OID 320512)
-- Name: users users_email_key32; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key32 UNIQUE (email);


--
-- TOC entry 6969 (class 2606 OID 320986)
-- Name: users users_email_key320; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key320 UNIQUE (email);


--
-- TOC entry 6971 (class 2606 OID 320988)
-- Name: users users_email_key321; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key321 UNIQUE (email);


--
-- TOC entry 6973 (class 2606 OID 320344)
-- Name: users users_email_key322; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key322 UNIQUE (email);


--
-- TOC entry 6975 (class 2606 OID 320990)
-- Name: users users_email_key323; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key323 UNIQUE (email);


--
-- TOC entry 6977 (class 2606 OID 320992)
-- Name: users users_email_key324; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key324 UNIQUE (email);


--
-- TOC entry 6979 (class 2606 OID 320342)
-- Name: users users_email_key325; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key325 UNIQUE (email);


--
-- TOC entry 6981 (class 2606 OID 320994)
-- Name: users users_email_key326; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key326 UNIQUE (email);


--
-- TOC entry 6983 (class 2606 OID 320340)
-- Name: users users_email_key327; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key327 UNIQUE (email);


--
-- TOC entry 6985 (class 2606 OID 320996)
-- Name: users users_email_key328; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key328 UNIQUE (email);


--
-- TOC entry 6987 (class 2606 OID 320998)
-- Name: users users_email_key329; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key329 UNIQUE (email);


--
-- TOC entry 6989 (class 2606 OID 320514)
-- Name: users users_email_key33; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key33 UNIQUE (email);


--
-- TOC entry 6991 (class 2606 OID 320338)
-- Name: users users_email_key330; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key330 UNIQUE (email);


--
-- TOC entry 6993 (class 2606 OID 320516)
-- Name: users users_email_key34; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key34 UNIQUE (email);


--
-- TOC entry 6995 (class 2606 OID 320518)
-- Name: users users_email_key35; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key35 UNIQUE (email);


--
-- TOC entry 6997 (class 2606 OID 320520)
-- Name: users users_email_key36; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key36 UNIQUE (email);


--
-- TOC entry 6999 (class 2606 OID 320522)
-- Name: users users_email_key37; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key37 UNIQUE (email);


--
-- TOC entry 7001 (class 2606 OID 320524)
-- Name: users users_email_key38; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key38 UNIQUE (email);


--
-- TOC entry 7003 (class 2606 OID 320526)
-- Name: users users_email_key39; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key39 UNIQUE (email);


--
-- TOC entry 7005 (class 2606 OID 320528)
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- TOC entry 7007 (class 2606 OID 320530)
-- Name: users users_email_key40; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key40 UNIQUE (email);


--
-- TOC entry 7009 (class 2606 OID 320532)
-- Name: users users_email_key41; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key41 UNIQUE (email);


--
-- TOC entry 7011 (class 2606 OID 320534)
-- Name: users users_email_key42; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key42 UNIQUE (email);


--
-- TOC entry 7013 (class 2606 OID 320536)
-- Name: users users_email_key43; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key43 UNIQUE (email);


--
-- TOC entry 7015 (class 2606 OID 320538)
-- Name: users users_email_key44; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key44 UNIQUE (email);


--
-- TOC entry 7017 (class 2606 OID 320540)
-- Name: users users_email_key45; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key45 UNIQUE (email);


--
-- TOC entry 7019 (class 2606 OID 320542)
-- Name: users users_email_key46; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key46 UNIQUE (email);


--
-- TOC entry 7021 (class 2606 OID 320544)
-- Name: users users_email_key47; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key47 UNIQUE (email);


--
-- TOC entry 7023 (class 2606 OID 320642)
-- Name: users users_email_key48; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key48 UNIQUE (email);


--
-- TOC entry 7025 (class 2606 OID 320644)
-- Name: users users_email_key49; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key49 UNIQUE (email);


--
-- TOC entry 7027 (class 2606 OID 320646)
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- TOC entry 7029 (class 2606 OID 320648)
-- Name: users users_email_key50; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key50 UNIQUE (email);


--
-- TOC entry 7031 (class 2606 OID 320776)
-- Name: users users_email_key51; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key51 UNIQUE (email);


--
-- TOC entry 7033 (class 2606 OID 320778)
-- Name: users users_email_key52; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key52 UNIQUE (email);


--
-- TOC entry 7035 (class 2606 OID 320780)
-- Name: users users_email_key53; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key53 UNIQUE (email);


--
-- TOC entry 7037 (class 2606 OID 320782)
-- Name: users users_email_key54; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key54 UNIQUE (email);


--
-- TOC entry 7039 (class 2606 OID 320784)
-- Name: users users_email_key55; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key55 UNIQUE (email);


--
-- TOC entry 7041 (class 2606 OID 320786)
-- Name: users users_email_key56; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key56 UNIQUE (email);


--
-- TOC entry 7043 (class 2606 OID 320788)
-- Name: users users_email_key57; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key57 UNIQUE (email);


--
-- TOC entry 7045 (class 2606 OID 320790)
-- Name: users users_email_key58; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key58 UNIQUE (email);


--
-- TOC entry 7047 (class 2606 OID 320792)
-- Name: users users_email_key59; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key59 UNIQUE (email);


--
-- TOC entry 7049 (class 2606 OID 320794)
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- TOC entry 7051 (class 2606 OID 320796)
-- Name: users users_email_key60; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key60 UNIQUE (email);


--
-- TOC entry 7053 (class 2606 OID 320798)
-- Name: users users_email_key61; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key61 UNIQUE (email);


--
-- TOC entry 7055 (class 2606 OID 320800)
-- Name: users users_email_key62; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key62 UNIQUE (email);


--
-- TOC entry 7057 (class 2606 OID 320802)
-- Name: users users_email_key63; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key63 UNIQUE (email);


--
-- TOC entry 7059 (class 2606 OID 320804)
-- Name: users users_email_key64; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key64 UNIQUE (email);


--
-- TOC entry 7061 (class 2606 OID 320806)
-- Name: users users_email_key65; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key65 UNIQUE (email);


--
-- TOC entry 7063 (class 2606 OID 320808)
-- Name: users users_email_key66; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key66 UNIQUE (email);


--
-- TOC entry 7065 (class 2606 OID 320810)
-- Name: users users_email_key67; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key67 UNIQUE (email);


--
-- TOC entry 7067 (class 2606 OID 320812)
-- Name: users users_email_key68; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key68 UNIQUE (email);


--
-- TOC entry 7069 (class 2606 OID 320814)
-- Name: users users_email_key69; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key69 UNIQUE (email);


--
-- TOC entry 7071 (class 2606 OID 320816)
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- TOC entry 7073 (class 2606 OID 320818)
-- Name: users users_email_key70; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key70 UNIQUE (email);


--
-- TOC entry 7075 (class 2606 OID 320820)
-- Name: users users_email_key71; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key71 UNIQUE (email);


--
-- TOC entry 7077 (class 2606 OID 320822)
-- Name: users users_email_key72; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key72 UNIQUE (email);


--
-- TOC entry 7079 (class 2606 OID 320824)
-- Name: users users_email_key73; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key73 UNIQUE (email);


--
-- TOC entry 7081 (class 2606 OID 320826)
-- Name: users users_email_key74; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key74 UNIQUE (email);


--
-- TOC entry 7083 (class 2606 OID 320828)
-- Name: users users_email_key75; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key75 UNIQUE (email);


--
-- TOC entry 7085 (class 2606 OID 320830)
-- Name: users users_email_key76; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key76 UNIQUE (email);


--
-- TOC entry 7087 (class 2606 OID 320832)
-- Name: users users_email_key77; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key77 UNIQUE (email);


--
-- TOC entry 7089 (class 2606 OID 320834)
-- Name: users users_email_key78; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key78 UNIQUE (email);


--
-- TOC entry 7091 (class 2606 OID 320836)
-- Name: users users_email_key79; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key79 UNIQUE (email);


--
-- TOC entry 7093 (class 2606 OID 320838)
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- TOC entry 7095 (class 2606 OID 320840)
-- Name: users users_email_key80; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key80 UNIQUE (email);


--
-- TOC entry 7097 (class 2606 OID 320842)
-- Name: users users_email_key81; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key81 UNIQUE (email);


--
-- TOC entry 7099 (class 2606 OID 320844)
-- Name: users users_email_key82; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key82 UNIQUE (email);


--
-- TOC entry 7101 (class 2606 OID 320846)
-- Name: users users_email_key83; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key83 UNIQUE (email);


--
-- TOC entry 7103 (class 2606 OID 320848)
-- Name: users users_email_key84; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key84 UNIQUE (email);


--
-- TOC entry 7105 (class 2606 OID 320850)
-- Name: users users_email_key85; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key85 UNIQUE (email);


--
-- TOC entry 7107 (class 2606 OID 320852)
-- Name: users users_email_key86; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key86 UNIQUE (email);


--
-- TOC entry 7109 (class 2606 OID 320854)
-- Name: users users_email_key87; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key87 UNIQUE (email);


--
-- TOC entry 7111 (class 2606 OID 320856)
-- Name: users users_email_key88; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key88 UNIQUE (email);


--
-- TOC entry 7113 (class 2606 OID 320858)
-- Name: users users_email_key89; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key89 UNIQUE (email);


--
-- TOC entry 7115 (class 2606 OID 320860)
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- TOC entry 7117 (class 2606 OID 320862)
-- Name: users users_email_key90; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key90 UNIQUE (email);


--
-- TOC entry 7119 (class 2606 OID 320864)
-- Name: users users_email_key91; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key91 UNIQUE (email);


--
-- TOC entry 7121 (class 2606 OID 320866)
-- Name: users users_email_key92; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key92 UNIQUE (email);


--
-- TOC entry 7123 (class 2606 OID 320868)
-- Name: users users_email_key93; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key93 UNIQUE (email);


--
-- TOC entry 7125 (class 2606 OID 320870)
-- Name: users users_email_key94; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key94 UNIQUE (email);


--
-- TOC entry 7127 (class 2606 OID 320872)
-- Name: users users_email_key95; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key95 UNIQUE (email);


--
-- TOC entry 7129 (class 2606 OID 320874)
-- Name: users users_email_key96; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key96 UNIQUE (email);


--
-- TOC entry 7131 (class 2606 OID 320876)
-- Name: users users_email_key97; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key97 UNIQUE (email);


--
-- TOC entry 7133 (class 2606 OID 320878)
-- Name: users users_email_key98; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key98 UNIQUE (email);


--
-- TOC entry 7135 (class 2606 OID 320880)
-- Name: users users_email_key99; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key99 UNIQUE (email);


--
-- TOC entry 7137 (class 2606 OID 52946)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3970 (class 1259 OID 52947)
-- Name: brand_treatments_user_treatment_unique; Type: INDEX; Schema: public; Owner: fusehealth_user
--

CREATE UNIQUE INDEX brand_treatments_user_treatment_unique ON public."BrandTreatments" USING btree ("userId", "treatmentId");


--
-- TOC entry 6471 (class 1259 OID 52948)
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: fusehealth_user
--

CREATE INDEX idx_session_expire ON public.session USING btree (expire);


--
-- TOC entry 6081 (class 1259 OID 321107)
-- Name: questionnaire_title_user_unique; Type: INDEX; Schema: public; Owner: fusehealth_user
--

CREATE UNIQUE INDEX questionnaire_title_user_unique ON public."Questionnaire" USING btree (title, "userId");


--
-- TOC entry 6458 (class 1259 OID 52950)
-- Name: tenant_product_clinic_product_unique; Type: INDEX; Schema: public; Owner: fusehealth_user
--

CREATE UNIQUE INDEX tenant_product_clinic_product_unique ON public."TenantProduct" USING btree ("clinicId", "productId");


--
-- TOC entry 7138 (class 2606 OID 322150)
-- Name: BrandSubscription BrandSubscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandSubscription"
    ADD CONSTRAINT "BrandSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 7139 (class 2606 OID 323262)
-- Name: BrandTreatments BrandTreatments_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandTreatments"
    ADD CONSTRAINT "BrandTreatments_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7140 (class 2606 OID 323257)
-- Name: BrandTreatments BrandTreatments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."BrandTreatments"
    ADD CONSTRAINT "BrandTreatments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7141 (class 2606 OID 323295)
-- Name: FormSectionTemplate FormSectionTemplate_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."FormSectionTemplate"
    ADD CONSTRAINT "FormSectionTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7142 (class 2606 OID 323284)
-- Name: FormSectionTemplate FormSectionTemplate_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."FormSectionTemplate"
    ADD CONSTRAINT "FormSectionTemplate_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7149 (class 2606 OID 322140)
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7150 (class 2606 OID 322145)
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE;


--
-- TOC entry 7143 (class 2606 OID 322135)
-- Name: Order Order_physicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES public."Physician"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7144 (class 2606 OID 322112)
-- Name: Order Order_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7145 (class 2606 OID 322130)
-- Name: Order Order_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."ShippingAddress"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7146 (class 2606 OID 322107)
-- Name: Order Order_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE;


--
-- TOC entry 7147 (class 2606 OID 322125)
-- Name: Order Order_treatmentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES public."TreatmentPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7148 (class 2606 OID 322102)
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 7151 (class 2606 OID 322842)
-- Name: Payment Payment_brandSubscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_brandSubscriptionId_fkey" FOREIGN KEY ("brandSubscriptionId") REFERENCES public."BrandSubscription"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7152 (class 2606 OID 322423)
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7154 (class 2606 OID 321087)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7155 (class 2606 OID 321092)
-- Name: PrescriptionProducts PrescriptionProducts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7153 (class 2606 OID 321066)
-- Name: Prescription Prescription_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 7157 (class 2606 OID 321149)
-- Name: QuestionOption QuestionOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionOption"
    ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7156 (class 2606 OID 321142)
-- Name: Question Question_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."QuestionnaireStep"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7161 (class 2606 OID 321133)
-- Name: QuestionnaireStep QuestionnaireStep_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."QuestionnaireStep"
    ADD CONSTRAINT "QuestionnaireStep_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7158 (class 2606 OID 321122)
-- Name: Questionnaire Questionnaire_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7159 (class 2606 OID 321108)
-- Name: Questionnaire Questionnaire_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7160 (class 2606 OID 321115)
-- Name: Questionnaire Questionnaire_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7162 (class 2606 OID 321685)
-- Name: ShippingAddress ShippingAddress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7163 (class 2606 OID 322847)
-- Name: ShippingOrder ShippingOrder_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingOrder"
    ADD CONSTRAINT "ShippingOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7164 (class 2606 OID 322854)
-- Name: ShippingOrder ShippingOrder_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."ShippingOrder"
    ADD CONSTRAINT "ShippingOrder_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."ShippingAddress"(id) ON UPDATE CASCADE;


--
-- TOC entry 7165 (class 2606 OID 322859)
-- Name: Subscription Subscription_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7166 (class 2606 OID 322864)
-- Name: Subscription Subscription_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7170 (class 2606 OID 323322)
-- Name: TenantProductForms TenantProductForms_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProductForms"
    ADD CONSTRAINT "TenantProductForms_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7171 (class 2606 OID 323312)
-- Name: TenantProductForms TenantProductForms_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProductForms"
    ADD CONSTRAINT "TenantProductForms_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7172 (class 2606 OID 323317)
-- Name: TenantProductForms TenantProductForms_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProductForms"
    ADD CONSTRAINT "TenantProductForms_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7173 (class 2606 OID 323300)
-- Name: TenantProductForms TenantProductForms_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProductForms"
    ADD CONSTRAINT "TenantProductForms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7174 (class 2606 OID 323305)
-- Name: TenantProductForms TenantProductForms_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProductForms"
    ADD CONSTRAINT "TenantProductForms_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7167 (class 2606 OID 323267)
-- Name: TenantProduct TenantProduct_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProduct"
    ADD CONSTRAINT "TenantProduct_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7168 (class 2606 OID 323272)
-- Name: TenantProduct TenantProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProduct"
    ADD CONSTRAINT "TenantProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7169 (class 2606 OID 323277)
-- Name: TenantProduct TenantProduct_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TenantProduct"
    ADD CONSTRAINT "TenantProduct_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7177 (class 2606 OID 321160)
-- Name: TreatmentPlan TreatmentPlan_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentPlan"
    ADD CONSTRAINT "TreatmentPlan_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7178 (class 2606 OID 321097)
-- Name: TreatmentProducts TreatmentProducts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7179 (class 2606 OID 321102)
-- Name: TreatmentProducts TreatmentProducts_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7175 (class 2606 OID 321076)
-- Name: Treatment Treatment_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE;


--
-- TOC entry 7176 (class 2606 OID 321071)
-- Name: Treatment Treatment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 7180 (class 2606 OID 53151)
-- Name: UserPatient UserPatient_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public."UserPatient"
    ADD CONSTRAINT "UserPatient_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 7181 (class 2606 OID 321001)
-- Name: users users_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fusehealth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 7360 (class 0 OID 0)
-- Dependencies: 7359
-- Name: DATABASE fusehealth_database; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON DATABASE fusehealth_database TO fusehealth_user;


--
-- TOC entry 7361 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO fusehealth_user;


--
-- TOC entry 2218 (class 826 OID 53161)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO fusehealth_user;


--
-- TOC entry 2221 (class 826 OID 53170)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: guilhermereis
--

ALTER DEFAULT PRIVILEGES FOR ROLE guilhermereis IN SCHEMA public GRANT ALL ON SEQUENCES TO fusehealth_user;


--
-- TOC entry 2219 (class 826 OID 53162)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO fusehealth_user;


--
-- TOC entry 2220 (class 826 OID 53169)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: guilhermereis
--

ALTER DEFAULT PRIVILEGES FOR ROLE guilhermereis IN SCHEMA public GRANT ALL ON TABLES TO fusehealth_user;


-- Completed on 2025-10-10 00:38:54 -03

--
-- PostgreSQL database dump complete
--

