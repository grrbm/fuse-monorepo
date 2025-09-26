--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

-- Started on 2025-09-19 06:00:15 UTC

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

ALTER TABLE ONLY public.users DROP CONSTRAINT "users_clinicId_fkey";
ALTER TABLE ONLY public."Treatment" DROP CONSTRAINT "Treatment_userId_fkey";
ALTER TABLE ONLY public."Treatment" DROP CONSTRAINT "Treatment_clinicId_fkey";
ALTER TABLE ONLY public."TreatmentProducts" DROP CONSTRAINT "TreatmentProducts_treatmentId_fkey";
ALTER TABLE ONLY public."TreatmentProducts" DROP CONSTRAINT "TreatmentProducts_productId_fkey";
ALTER TABLE ONLY public."ShippingAddress" DROP CONSTRAINT "ShippingAddress_orderId_fkey";
ALTER TABLE ONLY public."Questionnaire" DROP CONSTRAINT "Questionnaire_treatmentId_fkey";
ALTER TABLE ONLY public."QuestionnaireStep" DROP CONSTRAINT "QuestionnaireStep_questionnaireId_fkey";
ALTER TABLE ONLY public."Question" DROP CONSTRAINT "Question_stepId_fkey";
ALTER TABLE ONLY public."QuestionOption" DROP CONSTRAINT "QuestionOption_questionId_fkey";
ALTER TABLE ONLY public."Prescription" DROP CONSTRAINT "Prescription_patientId_fkey";
ALTER TABLE ONLY public."PrescriptionProducts" DROP CONSTRAINT "PrescriptionProducts_productId_fkey";
ALTER TABLE ONLY public."PrescriptionProducts" DROP CONSTRAINT "PrescriptionProducts_prescriptionId_fkey";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_orderId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_userId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_treatmentId_fkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_questionnaireId_fkey";
ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";
DROP INDEX public.idx_session_expire;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key9;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key86;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key85;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key84;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key83;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key82;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key81;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key80;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key8;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key79;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key78;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key77;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key76;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key75;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key74;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key73;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key72;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key71;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key70;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key7;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key69;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key68;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key67;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key66;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key65;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key64;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key63;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key62;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key61;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key60;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key6;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key59;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key58;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key57;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key56;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key55;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key54;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key53;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key52;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key51;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key50;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key5;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key49;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key48;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key47;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key46;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key45;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key44;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key43;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key42;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key41;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key40;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key4;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key39;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key38;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key37;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key36;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key35;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key34;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key33;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key32;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key31;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key30;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key3;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key29;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key28;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key27;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key26;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key25;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key24;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key23;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key22;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key21;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key20;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key2;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key19;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key18;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key17;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key16;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key15;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key14;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key13;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key12;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key11;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key10;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key1;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
ALTER TABLE ONLY public."Treatment" DROP CONSTRAINT "Treatment_pkey";
ALTER TABLE ONLY public."TreatmentProducts" DROP CONSTRAINT "TreatmentProducts_productId_treatmentId_key";
ALTER TABLE ONLY public."TreatmentProducts" DROP CONSTRAINT "TreatmentProducts_pkey";
ALTER TABLE ONLY public."ShippingAddress" DROP CONSTRAINT "ShippingAddress_pkey";
ALTER TABLE ONLY public."ShippingAddress" DROP CONSTRAINT "ShippingAddress_orderId_key";
ALTER TABLE ONLY public."SequelizeMeta" DROP CONSTRAINT "SequelizeMeta_pkey";
ALTER TABLE ONLY public."Questionnaire" DROP CONSTRAINT "Questionnaire_pkey";
ALTER TABLE ONLY public."QuestionnaireStep" DROP CONSTRAINT "QuestionnaireStep_pkey";
ALTER TABLE ONLY public."Question" DROP CONSTRAINT "Question_pkey";
ALTER TABLE ONLY public."QuestionOption" DROP CONSTRAINT "QuestionOption_pkey";
ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_pkey";
ALTER TABLE ONLY public."Prescription" DROP CONSTRAINT "Prescription_pkey";
ALTER TABLE ONLY public."PrescriptionProducts" DROP CONSTRAINT "PrescriptionProducts_prescriptionId_productId_key";
ALTER TABLE ONLY public."PrescriptionProducts" DROP CONSTRAINT "PrescriptionProducts_pkey";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key9";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key8";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key7";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key6";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key5";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key4";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key3";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key2";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key15";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key14";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key13";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key12";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key11";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key10";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key1";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_stripePaymentIntentId_key";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_pkey";
ALTER TABLE ONLY public."Payment" DROP CONSTRAINT "Payment_orderId_key";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_pkey";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key9";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key8";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key7";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key6";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key5";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key4";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key3";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key2";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key15";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key14";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key13";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key12";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key11";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key10";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key1";
ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_orderNumber_key";
ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_pkey";
ALTER TABLE ONLY public."Entity" DROP CONSTRAINT "Entity_pkey";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key9";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key87";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key86";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key85";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key84";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key83";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key82";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key81";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key80";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key8";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key79";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key78";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key77";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key76";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key75";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key74";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key73";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key72";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key71";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key70";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key7";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key69";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key68";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key67";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key66";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key65";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key64";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key63";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key62";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key61";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key60";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key6";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key59";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key58";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key57";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key56";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key55";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key54";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key53";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key52";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key51";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key50";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key5";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key49";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key48";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key47";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key46";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key45";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key44";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key43";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key42";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key41";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key40";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key4";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key39";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key38";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key37";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key36";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key35";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key34";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key33";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key32";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key31";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key30";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key3";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key29";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key28";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key27";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key26";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key25";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key24";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key23";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key22";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key21";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key20";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key2";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key19";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key18";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key17";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key16";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key15";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key14";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key13";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key12";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key11";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key10";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key1";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_slug_key";
ALTER TABLE ONLY public."Clinic" DROP CONSTRAINT "Clinic_pkey";
DROP TABLE public.users;
DROP TABLE public.session;
DROP TABLE public."TreatmentProducts";
DROP TABLE public."Treatment";
DROP TABLE public."ShippingAddress";
DROP TABLE public."SequelizeMeta";
DROP TABLE public."QuestionnaireStep";
DROP TABLE public."Questionnaire";
DROP TABLE public."QuestionOption";
DROP TABLE public."Question";
DROP TABLE public."Product";
DROP TABLE public."PrescriptionProducts";
DROP TABLE public."Prescription";
DROP TABLE public."Payment";
DROP TABLE public."OrderItem";
DROP TABLE public."Order";
DROP TABLE public."Entity";
DROP TABLE public."Clinic";
DROP TYPE public.enum_users_role;
DROP TYPE public."enum_Question_answerType";
DROP TYPE public."enum_Payment_status";
DROP TYPE public."enum_Payment_paymentMethod";
DROP TYPE public."enum_Order_status";
DROP TYPE public."enum_Order_billingPlan";
--
-- TOC entry 914 (class 1247 OID 30720)
-- Name: enum_Order_billingPlan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Order_billingPlan" AS ENUM (
    'monthly',
    'quarterly',
    'biannual'
);


--
-- TOC entry 911 (class 1247 OID 30703)
-- Name: enum_Order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Order_status" AS ENUM (
    'pending',
    'payment_processing',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);


--
-- TOC entry 926 (class 1247 OID 30788)
-- Name: enum_Payment_paymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Payment_paymentMethod" AS ENUM (
    'card',
    'bank_transfer',
    'digital_wallet'
);


--
-- TOC entry 923 (class 1247 OID 30773)
-- Name: enum_Payment_status; Type: TYPE; Schema: public; Owner: -
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


--
-- TOC entry 902 (class 1247 OID 24344)
-- Name: enum_Question_answerType; Type: TYPE; Schema: public; Owner: -
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


--
-- TOC entry 869 (class 1247 OID 16700)
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'patient',
    'doctor',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16862)
-- Name: Clinic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Clinic" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    slug character varying(255) NOT NULL,
    logo text NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16717)
-- Name: Entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Entity" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 30727)
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderNumber" character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "treatmentId" uuid NOT NULL,
    "questionnaireId" uuid,
    status public."enum_Order_status" DEFAULT 'pending'::public."enum_Order_status" NOT NULL,
    "billingPlan" public."enum_Order_billingPlan" NOT NULL,
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
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 30755)
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
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
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 30795)
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 222 (class 1259 OID 16729)
-- Name: Prescription; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 224 (class 1259 OID 16749)
-- Name: PrescriptionProducts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrescriptionProducts" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "prescriptionId" uuid NOT NULL,
    quantity integer NOT NULL,
    "productId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16722)
-- Name: Product; Type: TABLE; Schema: public; Owner: -
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
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 24367)
-- Name: Question; Type: TABLE; Schema: public; Owner: -
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
    "conditionalLogic" text
);


--
-- TOC entry 230 (class 1259 OID 24380)
-- Name: QuestionOption; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 227 (class 1259 OID 24319)
-- Name: Questionnaire; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 228 (class 1259 OID 24331)
-- Name: QuestionnaireStep; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 217 (class 1259 OID 16481)
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 30814)
-- Name: ShippingAddress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ShippingAddress" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    "orderId" uuid NOT NULL,
    address character varying(255) NOT NULL,
    apartment character varying(255),
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    "zipCode" character varying(255) NOT NULL,
    country character varying(2) DEFAULT 'US'::character varying NOT NULL,
    "trackingNumber" character varying(255),
    carrier character varying(255),
    "shippedAt" timestamp with time zone,
    "estimatedDeliveryDate" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "deliveryNotes" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16739)
-- Name: Treatment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Treatment" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    name character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "clinicId" uuid NOT NULL,
    "treatmentLogo" text
);


--
-- TOC entry 225 (class 1259 OID 16766)
-- Name: TreatmentProducts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TreatmentProducts" (
    id uuid NOT NULL,
    "deletedAt" timestamp with time zone,
    dosage character varying(255) NOT NULL,
    "numberOfDoses" integer NOT NULL,
    "nextDose" timestamp with time zone NOT NULL,
    "productId" uuid NOT NULL,
    "treatmentId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 16506)
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying(255) NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp with time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16707)
-- Name: users; Type: TABLE; Schema: public; Owner: -
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
    "deaNumber" character varying(255),
    "npiNumber" character varying(255),
    licenses json,
    "pharmacyPhysicianId" character varying(255)
);


--
-- TOC entry 4877 (class 0 OID 16862)
-- Dependencies: 226
-- Data for Name: Clinic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Clinic" (id, "deletedAt", slug, logo, name, "createdAt", "updatedAt") FROM stdin;
6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	saboia.xyz	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757646359188-tower.jpg	Saboia.XYZ	2025-09-12 03:04:52.636+00	2025-09-12 03:05:59.261+00
0d0f12ea-fdc5-4227-a0b9-b3e5b24d0b48	\N	limit		Limit	2025-09-16 04:09:54.01+00	2025-09-16 04:09:54.01+00
29e3985c-20cd-45a8-adf7-d6f4cdd21a15	\N	limit-1		Limit	2025-09-16 04:11:02.255+00	2025-09-16 04:11:02.255+00
\.


--
-- TOC entry 4871 (class 0 OID 16717)
-- Dependencies: 220
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Entity" (id, "deletedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4882 (class 0 OID 30727)
-- Dependencies: 231
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "deletedAt", "orderNumber", "userId", "treatmentId", "questionnaireId", status, "billingPlan", "subtotalAmount", "discountAmount", "taxAmount", "shippingAmount", "totalAmount", notes, "questionnaireAnswers", "shippedAt", "deliveredAt", "createdAt", "updatedAt") FROM stdin;
fb1ccfe5-657d-4320-912c-4076c4905a40	\N	ORD-1757996649126-GX9NIB	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	monthly	2000.00	0.00	0.00	0.00	2000.00	\N	{}	\N	\N	2025-09-16 04:24:09.128+00	2025-09-16 04:24:09.128+00
ce858a6f-662b-43a5-abfb-81e2412cb372	\N	ORD-1757997157841-L6SH5U	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	monthly	1300.00	0.00	0.00	0.00	1300.00	\N	{}	\N	\N	2025-09-16 04:32:37.841+00	2025-09-16 04:32:37.841+00
c451ffec-5618-47e8-a849-b5aee9def1db	\N	ORD-1757997545952-4VI19A	63ab9a4a-ddd0-492b-9912-c7a731df19f4	724eb0c4-54a3-447c-8814-de4c1060e77a	\N	pending	monthly	350.00	0.00	0.00	0.00	350.00	\N	{}	\N	\N	2025-09-16 04:39:05.952+00	2025-09-16 04:39:05.952+00
605c2882-2432-4e31-9c19-2c09eded4ebe	\N	ORD-1757998375524-T02VIR	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	monthly	2100.00	0.00	0.00	0.00	2100.00	\N	{}	\N	\N	2025-09-16 04:52:55.524+00	2025-09-16 04:52:55.524+00
67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	\N	ORD-1757999721881-11PO6N	63ab9a4a-ddd0-492b-9912-c7a731df19f4	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	pending	monthly	900.00	0.00	0.00	0.00	900.00	\N	{}	\N	\N	2025-09-16 05:15:21.882+00	2025-09-16 05:15:21.882+00
22659bdc-ce0d-4ee7-bf69-869fd119d0c2	\N	ORD-1758069422751-XN63AZ	63ab9a4a-ddd0-492b-9912-c7a731df19f4	724eb0c4-54a3-447c-8814-de4c1060e77a	\N	pending	monthly	79.00	0.00	0.00	0.00	79.00	\N	{}	\N	\N	2025-09-17 00:37:02.751+00	2025-09-17 00:37:02.751+00
d1526926-5dd0-4cc4-87e1-d060a312dc3a	\N	ORD-1758260172037-LJON4P	63ab9a4a-ddd0-492b-9912-c7a731df19f4	b689451f-db88-4c98-900e-df3dbcfebe2a	\N	pending	monthly	299.00	0.00	0.00	0.00	299.00	\N	{}	\N	\N	2025-09-19 05:36:12.039+00	2025-09-19 05:36:12.039+00
\.


--
-- TOC entry 4883 (class 0 OID 30755)
-- Dependencies: 232
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "deletedAt", "orderId", "productId", quantity, "unitPrice", "totalPrice", dosage, notes, "createdAt", "updatedAt") FROM stdin;
9b8e1c9e-a548-4bb6-8e29-085478440f61	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 04:24:09.33+00	2025-09-16 04:24:09.33+00
6a7ada85-aaf6-4760-9239-6f62ff792114	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	550e8400-e29b-41d4-a716-446655440102	1	1100.00	1100.00	2.4 mg subcutaneous injection weekly	\N	2025-09-16 04:24:09.512+00	2025-09-16 04:24:09.512+00
4452daf2-b63d-43f2-816b-1d58fb9b7e4a	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	550e8400-e29b-41d4-a716-446655440105	1	450.00	450.00	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	\N	2025-09-16 04:32:37.85+00	2025-09-16 04:32:37.85+00
77f848a8-e0cc-4c33-8ba5-277aff24fd1f	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	550e8400-e29b-41d4-a716-446655440104	1	850.00	850.00	3 mg subcutaneous injection daily	\N	2025-09-16 04:32:37.853+00	2025-09-16 04:32:37.853+00
0a12e6de-3940-4086-b835-c5aaffeabf1b	\N	c451ffec-5618-47e8-a849-b5aee9def1db	550e8400-e29b-41d4-a716-446655440001	1	350.00	350.00	500 mg per infusion	\N	2025-09-16 04:39:05.956+00	2025-09-16 04:39:05.956+00
08e26fb7-2639-4f0f-907a-bf4195203796	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 04:52:55.532+00	2025-09-16 04:52:55.532+00
50ca993b-3e34-431d-81d9-8a526e74c823	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	550e8400-e29b-41d4-a716-446655440103	1	1200.00	1200.00	2.5–15 mg subcutaneous injection weekly	\N	2025-09-16 04:52:55.536+00	2025-09-16 04:52:55.536+00
9d40c33a-7b26-4411-8861-d34567d25253	\N	67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	550e8400-e29b-41d4-a716-446655440101	1	900.00	900.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-16 05:15:22.072+00	2025-09-16 05:15:22.072+00
c70d12e2-86e0-48b8-ae4e-0334b6a37351	\N	22659bdc-ce0d-4ee7-bf69-869fd119d0c2	550e8400-e29b-41d4-a716-446655440002	1	79.00	79.00	300 mg daily	\N	2025-09-17 00:37:02.759+00	2025-09-17 00:37:02.759+00
d0ed16c1-eaed-425d-98aa-ad855e5301c7	\N	d1526926-5dd0-4cc4-87e1-d060a312dc3a	550e8400-e29b-41d4-a716-446655440201	1	299.00	299.00	0.25–2 mg subcutaneous injection weekly	\N	2025-09-19 05:36:12.243+00	2025-09-19 05:36:12.243+00
\.


--
-- TOC entry 4884 (class 0 OID 30795)
-- Dependencies: 233
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "deletedAt", "orderId", "stripePaymentIntentId", status, "paymentMethod", amount, currency, "refundedAmount", "stripeChargeId", "stripeCustomerId", "lastFourDigits", "cardBrand", "cardCountry", "stripeMetadata", "failureReason", "paidAt", "refundedAt", "createdAt", "updatedAt") FROM stdin;
8fb95243-961a-438c-b33d-9ef508ec06c0	\N	fb1ccfe5-657d-4320-912c-4076c4905a40	pi_3S7qR4GWJaDesMl93GrqozS5	pending	card	2000.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:24:10.695+00	2025-09-16 04:24:10.695+00
108d84d4-1790-40fa-91a0-aabe43c42d8e	\N	ce858a6f-662b-43a5-abfb-81e2412cb372	pi_3S7qZGGWJaDesMl93ZLUL2o1	pending	card	1300.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:32:38.118+00	2025-09-16 04:32:38.118+00
d6851026-619e-4d14-967d-31f443d1e6dd	\N	c451ffec-5618-47e8-a849-b5aee9def1db	pi_3S7qfWGWJaDesMl90Fs9XXav	pending	card	350.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:39:06.213+00	2025-09-16 04:39:06.213+00
992f678c-98c8-4ff4-95db-a8960c7015d7	\N	605c2882-2432-4e31-9c19-2c09eded4ebe	pi_3S7qstGWJaDesMl918PqxFGD	pending	card	2100.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 04:52:55.799+00	2025-09-16 04:52:55.799+00
977b03a3-4f69-4c23-9f2b-b1e751624066	\N	67ff6aa7-ff2d-4d9f-8a28-ad24b4840f23	pi_3S7rEdGWJaDesMl93OLi9K0S	pending	card	900.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 05:15:23.099+00	2025-09-16 05:15:23.099+00
c6fbcea2-d847-4130-8bb6-9f93a2a937b6	\N	22659bdc-ce0d-4ee7-bf69-869fd119d0c2	pi_3S89MoGWJaDesMl93aI3CHTt	pending	card	79.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-17 00:37:03.078+00	2025-09-17 00:37:03.078+00
129b2f91-3f0e-4ba7-8293-3237fc2ae603	\N	d1526926-5dd0-4cc4-87e1-d060a312dc3a	pi_3S8wzRGWJaDesMl92URWNwNM	pending	card	299.00	USD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-19 05:36:13.284+00	2025-09-19 05:36:13.284+00
\.


--
-- TOC entry 4873 (class 0 OID 16729)
-- Dependencies: 222
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Prescription" (id, "deletedAt", name, "expiresAt", "writtenAt", "patientId", "doctorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4875 (class 0 OID 16749)
-- Dependencies: 224
-- Data for Name: PrescriptionProducts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrescriptionProducts" (id, "deletedAt", "prescriptionId", quantity, "productId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4872 (class 0 OID 16722)
-- Dependencies: 221
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, "deletedAt", name, description, price, "activeIngredients", dosage, "imageUrl", "createdAt", "updatedAt") FROM stdin;
550e8400-e29b-41d4-a716-446655440001	\N	NAD+ IV Infusion	High-dose NAD+ delivered intravenously to replenish cellular energy, support DNA repair, and promote anti-aging benefits.	350	{NAD+}	500 mg per infusion	https://example.com/images/nad-iv.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440002	\N	NAD+ Capsules	Daily supplement containing bioavailable NAD+ precursors to maintain energy and support healthy aging.	79	{NAD+,Niacinamide}	300 mg daily	https://example.com/images/nad-capsules.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440003	\N	NAD+ Longevity Drip	Combination of NAD+ with B vitamins to enhance metabolism, reduce fatigue, and support nervous system health.	400	{NAD+,"Vitamin B12","Vitamin B6"}	750 mg NAD+ + B-complex per infusion	https://example.com/images/nad-b-complex.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440004	\N	NAD+ Detox Booster	Powerful anti-aging and detox combination with NAD+ and glutathione to fight oxidative stress and restore cellular health.	450	{NAD+,Glutathione}	500 mg NAD+ + 2000 mg Glutathione per infusion	https://example.com/images/nad-glutathione.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440005	\N	NAD+ Sublingual Spray	Fast-absorbing sublingual NAD+ spray to support daily energy, mood, and anti-aging.	65	{NAD+}	50 mg per spray, 2 sprays daily	https://example.com/images/nad-spray.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440101	\N	Ozempic (Semaglutide Injection)	A GLP-1 receptor agonist that helps regulate appetite and blood sugar, promoting weight loss and improving metabolic health.	900	{Semaglutide}	0.25–2 mg subcutaneous injection weekly	https://example.com/images/ozempic.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440102	\N	Wegovy (Semaglutide Injection)	An FDA-approved higher-dose version of semaglutide designed specifically for chronic weight management.	1100	{Semaglutide}	2.4 mg subcutaneous injection weekly	https://example.com/images/wegovy.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440103	\N	Mounjaro (Tirzepatide Injection)	A dual GIP and GLP-1 receptor agonist that enhances weight loss and improves insulin sensitivity for type 2 diabetes and obesity.	1200	{Tirzepatide}	2.5–15 mg subcutaneous injection weekly	https://example.com/images/mounjaro.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440104	\N	Saxenda (Liraglutide Injection)	A daily GLP-1 receptor agonist injection that reduces appetite and helps with sustained weight loss.	850	{Liraglutide}	3 mg subcutaneous injection daily	https://example.com/images/saxenda.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440105	\N	Contrave (Naltrexone/Bupropion Tablets)	An oral medication combining an opioid antagonist and an antidepressant to reduce food cravings and regulate appetite.	450	{Naltrexone,Bupropion}	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	https://example.com/images/contrave.jpg	2025-09-13 01:57:34.854+00	2025-09-13 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440201	\N	Compounded Semaglutide	Most commonly prescribed for consistent weight management. Same active ingredient as Ozempic®.	299	{Semaglutide}	0.25–2 mg subcutaneous injection weekly	https://example.com/images/compounded-semaglutide.jpg	2025-09-18 01:57:34.854+00	2025-09-18 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440202	\N	Compounded Tirzepatide	Dual GIP and GLP-1 receptor agonist for enhanced weight loss results.	399	{Tirzepatide}	2.5–15 mg subcutaneous injection weekly	https://example.com/images/compounded-tirzepatide.jpg	2025-09-18 01:57:34.854+00	2025-09-18 01:57:34.854+00
550e8400-e29b-41d4-a716-446655440203	\N	Compounded Liraglutide	Daily GLP-1 receptor agonist for appetite control and sustained weight loss.	250	{Liraglutide}	3 mg subcutaneous injection daily	https://example.com/images/compounded-liraglutide.jpg	2025-09-18 01:57:34.854+00	2025-09-18 01:57:34.854+00
\.


--
-- TOC entry 4880 (class 0 OID 24367)
-- Dependencies: 229
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Question" (id, "deletedAt", "questionText", "answerType", "isRequired", "questionOrder", placeholder, "helpText", "stepId", "createdAt", "updatedAt", "footerNote", "questionSubtype", "conditionalLogic") FROM stdin;
2269743e-0631-4e7e-8397-fab78bdd3f72	\N	Date of Birth	date	t	1	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
5a6e852b-6733-43c6-a3c8-42793f4fd56d	\N	Sex assigned at birth	radio	t	2	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
df2125a6-3da0-45da-b496-5da9f5faa9a7	\N	Phone Number	phone	t	3	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
44d0682b-31af-450b-87e4-fc814322344d	\N	Zip Code	text	t	4	\N	\N	16e9bb0d-91d1-4111-814b-6895a035d6f8	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
c5a78559-7119-4d28-938b-e71dcf88440c	\N	Height	height	t	1	\N	\N	1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
5e612ca9-eba3-4ebf-b588-90a855d1139f	\N	Weight	weight	t	2	\N	\N	1d4e06cf-110f-48a5-a8d5-4a9e7b817e62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
9eaf9682-3de3-4e5b-b002-cad5921c02d3	\N	Have you ever been diagnosed with any of the following?	checkbox	t	1	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
81008033-750c-485f-a5ee-804ddfcddb72	\N	Do you have any allergies? (Food, medications, supplements, dyes, other)	textarea	f	2	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
51f63ea3-3b73-4e80-be9b-0318feda8e19	\N	Please list current medications, herbals, or supplements (Name, dose, reason)	textarea	f	3	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
3b9551a0-98a4-4abb-9692-88c38b66c693	\N	Have you had any recent surgeries or hospitalizations?	radio	t	4	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
af568dc4-b13b-47d3-b039-a2fdb2265d1a	\N	Are you currently pregnant, breastfeeding, or planning pregnancy?	radio	t	5	\N	\N	ee5c1f70-eae6-4991-888b-6c0a99ba003e	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
08ce5f6c-5d7e-49e2-95ac-2bb95b48120b	\N	Do you smoke or vape?	radio	t	1	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
893d96c7-e2ef-4902-8c85-714acec7e771	\N	Do you consume alcohol?	radio	t	2	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
4695b661-47a1-4e90-a084-377568871f41	\N	How often do you exercise?	radio	t	3	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
257b17ee-3c74-421d-a2b2-6edfe2faeb00	\N	How would you describe your stress level?	radio	t	4	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
b05e3509-149d-4c5a-a6df-3d29f5a7a186	\N	How many hours of sleep do you typically get?	radio	t	5	\N	\N	34643bfd-1617-487c-958f-25ff3607bc62	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
4a03f66e-3724-479c-8e56-3a33aa70df9e	\N	What are your goals with NAD+ treatment? (Select all that apply)	checkbox	t	1	\N	\N	615e5d08-0e76-4efd-b7b6-6e879ac30358	2025-09-13 01:03:17.627+00	2025-09-13 01:03:17.627+00	\N	\N	\N
2c94c842-10cf-40c6-802b-26d8e13b8928	\N	Have you ever tried NAD+ before?	radio	t	1	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N
efcc28e9-18c6-4ceb-abb6-b5e5e9d5145c	\N	If yes, what benefits did you notice?	textarea	f	2	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N
44208bc8-1fe1-4b7e-a5a1-6053e6610f18	\N	If no, what interests you most about NAD+?	textarea	f	3	\N	\N	8e76b4dc-40fe-430c-911b-5c79541bd48b	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N
19149d80-8ec6-433b-8e28-22161521fc05	\N	How often are you looking to use NAD+?	radio	t	1	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N
22389579-ea11-4476-9031-99c68bc8cfbf	\N	What kind of results are you hoping to achieve in the first 30 days?	checkbox	t	2	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N
683a9ef3-e655-4cd9-be8f-33a7c7660ff7	\N	Other results you hope to achieve (optional)	textarea	f	3	\N	\N	3203bc79-aa85-447f-982a-902416bbbce8	2025-09-13 01:03:17.628+00	2025-09-13 01:03:17.628+00	\N	\N	\N
9c863db3-eeee-4e7e-a956-09481aec7d46	\N	What is your main goal with weight loss medication?	radio	t	1	\N	Please select the primary reason you're seeking treatment.	494573f0-07e4-41cd-96d6-216a8f15aadc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
b410a34a-6eeb-4134-8dc1-18f7d9401389	\N	Have you tried losing weight before?	radio	t	1	\N	This helps us understand your journey.	8a345b19-211e-49c5-9d81-b7b868f9c537	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
a2ef72cd-5c8c-4fcc-b1f5-7b54aeecd146	\N	What is the main difficulty you face when trying to lose weight?	radio	t	1	\N	Select the one that applies most to you.	f7f9d3d9-ea39-4103-9b10-644a41f84a1e	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
74d304d5-2d46-414a-ae61-2ae9fc2d8a7d	\N	What state do you live in?	select	t	1	\N	We need to verify our services are available in your location.	fce69cde-4d4c-4465-a251-e929522ba024	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
fda21e98-558b-474b-837f-01611474391d	\N	What's your gender at birth?	radio	t	1	\N	This helps us provide you with personalized care.	54f9762f-a900-4325-a04a-ab5afcec282d	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
c98a86f7-d5d8-4965-a38d-022502ad951a	\N	What's your date of birth?	date	t	1	\N	We need to verify you're at least 18 years old.	ecaa2116-ce93-4bb0-b869-c84f740bdffc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
ddcdada6-739b-4d4f-a6c1-8c3bb0914fdc	\N	First Name	text	t	1	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
bfbb9599-1eda-44ac-8387-0b83f24c6998	\N	Last Name	text	t	2	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
f3b0e54a-4a37-4d1e-9a5c-62cbffc37320	\N	Email Address	email	t	3	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
1cf8722b-d826-4b0d-8b24-109210be9b9d	\N	Mobile Number (US Only)	phone	t	4	\N	\N	40eac62a-6faa-4aa0-87cf-5662f8ff6b49	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
a5e32329-80d2-4ae4-acb0-8d3a94273c54	\N	Current Weight (pounds)	number	t	1	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
b0258a7c-2ce9-4da3-8567-51f068f20ac0	\N	Height (feet)	number	t	2	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
b33e5222-2755-4b10-96e2-ce5ede1288c7	\N	Height (inches)	number	t	3	\N	\N	30c35e91-cdb7-488e-bee3-f25d753edd94	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
a19c5e29-aba2-4a75-94c2-8538df51f23c	\N	Do you have any of these medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	8e41a76d-cb19-4efd-af93-6b1a55242cc3	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
c6f43c4d-f86f-4b24-8beb-2f5833ebb296	\N	Do you have any of these serious medical conditions?	checkbox	t	1	\N	This helps us ensure your safety and determine the best treatment option. Select all that apply.	d12604a8-5711-4cf4-9946-617c4f12a97c	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
eafa5812-6375-411c-b01a-fbf2df80b2c9	\N	Are you allergic to any of the following?	checkbox	t	1	\N	Select all that apply to help us ensure your safety.	81c71333-a59c-4c63-b6cd-7159c636851d	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
20f6d250-fbbc-488b-b26c-f1c80368f2a0	\N	Are you currently taking any medications?	radio	t	1	\N	Please list all medications, vitamins, and supplements.	54c7c986-ca72-481a-b6f4-c0bc68b595bc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
e003789e-1383-4e9e-9065-713ae3216a11	\N	Are you currently taking any of the following medications?	checkbox	t	1	\N	Select all that apply.	29165ffd-1067-45a3-b5c9-28209e9865d2	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
f1059dae-2daf-442b-ba86-e17917c4b43e	\N	Have you taken weight loss medications before?	radio	t	1	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	\N
9d1e551f-a636-4f99-b6ad-0c435b35999d	\N	Please list all medications, vitamins, and supplements	textarea	f	2	Please list all medications, vitamins, and supplements you are currently taking...	\N	54c7c986-ca72-481a-b6f4-c0bc68b595bc	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	questionOrder:1,answer:Yes, I take medications
2ffd8c63-ceed-49d4-9916-2e10b52a5f8a	\N	Which medication WERE YOU LAST ON?	radio	f	2	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	\N	\N	questionOrder:1,answer:Yes, I have taken weight loss medications before.
76e875ad-1914-4a24-b1cd-e907bdf0bbea	\N	Goal Weight (pounds)	number	t	1	\N	Enter your target weight in pounds.	4479a22d-7b23-4937-bae3-2f0eff0dbdba	2025-09-18 02:18:06.62+00	2025-09-18 02:18:06.62+00	<b>You're taking the first step!</b> Our medical team will create a personalized plan\n  based on your goals.	Lbs	\N
9149cfe8-1aa7-4a2f-80ee-b74c16e6e914	\N	What dose were you on?	text	f	3	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:36:54.222875+00	2025-09-19 04:36:54.222875+00	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)
a596dbc1-348b-43df-9aec-85001801f6bd	\N	When did you last take it?	text	f	4	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:39:12.254894+00	2025-09-19 04:39:12.254894+00	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)
1a3bc588-e2a1-446c-9b7d-f4b2dcc14571	\N	Did you experience any side effects?	radio	f	5	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:43:23.788211+00	2025-09-19 04:43:23.788211+00	\N	\N	questionOrder:2,answer:Semaglutide (Ozempic, Wegovy)
16f3832e-e9e3-4b39-99f6-423f1907f623	\N		textarea	f	9	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:49:06.672662+00	2025-09-19 04:49:06.672662+00	\N	\N	questionOrder:5,answer:Yes
a0371b68-6e77-4ba1-9c40-686f6af2cf62	\N	What dose were you on?	text	f	21	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:08:47.41765+00	2025-09-19 05:08:47.41765+00	\N	\N	questionOrder:2,answer:Other weight loss medication
cac7b0cd-f108-4312-9c9c-42c96e4e7fbb	\N	When did you last take it?	text	f	22	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:08:56.401484+00	2025-09-19 05:08:56.401484+00	\N	\N	questionOrder:2,answer:Other weight loss medication
86a9a0d1-59ea-4da5-9d44-f4dd39a7da94	\N	Did you experience any side effects?	radio	f	23	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:09:06.639732+00	2025-09-19 05:09:06.639732+00	\N	\N	questionOrder:2,answer:Other weight loss medication
627cc6c0-41a2-4181-9a55-85470b23fb17	\N		textarea	f	24	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:10:01.411803+00	2025-09-19 05:10:01.411803+00	\N	\N	questionOrder:23,answer:Yes
4f7761ce-95cb-4a5f-92f6-7533206f4822	\N	What dose were you on?	text	f	11	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:54:54.001845+00	2025-09-19 04:54:54.001845+00	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)
ce1c461a-e062-41bc-8cbc-6c6a86582ccf	\N	When did you last take it?	text	f	12	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:55:10.810652+00	2025-09-19 04:55:10.810652+00	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)
b0fce918-96fb-4012-a1d1-9fe8fe81925f	\N	Did you experience any side effects?	radio	f	13	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:51:13.406514+00	2025-09-19 04:51:13.406514+00	\N	\N	questionOrder:2,answer:Liraglutide (Saxenda, Victoza)
544ddd65-572d-4b81-8910-b8a052a7ee6f	\N		textarea	f	13	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 04:52:38.796735+00	2025-09-19 04:52:38.796735+00	\N	\N	questionOrder:13,answer:Yes
3698b8cc-91f8-4f60-900f-c9dac8b7a40f	\N	What dose were you on?	text	f	19	1mg weekly	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:00:54.991934+00	2025-09-19 05:00:54.991934+00	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)
83a7a166-ddd4-4ffb-8614-9df92739cf57	\N	When did you last take it?	text	f	20	eg: 2 months ago, last week	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:00:54.991934+00	2025-09-19 05:00:54.991934+00	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)
93f87772-01fa-4864-a7c6-bf8efc8493f9	\N	Did you experience any side effects?	radio	f	21	\N	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:01:56.978184+00	2025-09-19 05:01:56.978184+00	\N	\N	questionOrder:2,answer:Tirzepatide (Mounjaro, Zepbound)
b1de48b4-3a84-410e-a754-dd752269aaa7	\N		textarea	f	22	Please describe any side effects you experienced (optional)...	\N	0cc47ef9-3c65-4165-8b2f-1557787a7f6f	2025-09-19 05:02:29.13368+00	2025-09-19 05:02:29.13368+00	\N	\N	questionOrder:21,answer:Yes
\.


--
-- TOC entry 4881 (class 0 OID 24380)
-- Dependencies: 230
-- Data for Name: QuestionOption; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 4878 (class 0 OID 24319)
-- Dependencies: 227
-- Data for Name: Questionnaire; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Questionnaire" (id, "deletedAt", title, description, "treatmentId", "createdAt", "updatedAt", "checkoutStepPosition") FROM stdin;
aa08a2d8-b298-434a-ad06-3ec7485fe50c	\N	NAD+ Intake Questionnaire	Complete intake questionnaire for NAD+ treatment	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:03:17.616+00	2025-09-13 01:03:17.616+00	0
c974ee9f-3e61-42b9-a0d2-08d1ca6e43f4	\N	Weight Loss Checkout	Select your weight loss plan and complete your order	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 03:23:32.268+00	2025-09-16 03:23:32.268+00	0
6c7ba2c8-c4b4-48e7-af7f-5537ec7bba0c	\N	Weight Loss Assessment	Complete your personalized weight loss evaluation	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:18:06.611+00	2025-09-18 02:18:06.611+00	19
\.


--
-- TOC entry 4879 (class 0 OID 24331)
-- Dependencies: 228
-- Data for Name: QuestionnaireStep; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 4868 (class 0 OID 16481)
-- Dependencies: 217
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SequelizeMeta" (name) FROM stdin;
20250902021746-create_users_table.js
20250902023839-create_users_table_v2.js
20250902024735-add_hipaa_fields_to_users.js
20250904024937-create_session_table.js
20250904200249-add-address-fields-to-users.js
\.


--
-- TOC entry 4885 (class 0 OID 30814)
-- Dependencies: 234
-- Data for Name: ShippingAddress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ShippingAddress" (id, "deletedAt", "orderId", address, apartment, city, state, "zipCode", country, "trackingNumber", carrier, "shippedAt", "estimatedDeliveryDate", "deliveredAt", "deliveryNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4874 (class 0 OID 16739)
-- Dependencies: 223
-- Data for Name: Treatment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Treatment" (id, "deletedAt", name, "userId", "createdAt", "updatedAt", "clinicId", "treatmentLogo") FROM stdin;
1e9d248d-5ff8-47b8-86a8-65200aa04b39	\N	Immune Support	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-12 19:36:56.119+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N
44085547-afc4-4722-adf1-6722b4d4e0e9	\N	Energy Enhancement	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-12 19:36:56.119+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N
724eb0c4-54a3-447c-8814-de4c1060e77a	\N	Anti Aging NAD+	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-12 20:29:51.426+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757708989911-flower.jpg
0bc5e6fa-360f-412c-8d11-34910ee05fe0	\N	Anti Aging Glutathione	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-12 19:36:56.119+00	2025-09-12 20:35:24.404+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757709322973-bird.jpg
ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	\N	Weight Loss	150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	2025-09-16 02:47:36.817+00	2025-09-16 04:37:36.584+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1757997453304-weight-loss.jpg
b689451f-db88-4c98-900e-df3dbcfebe2a	\N	Weight Loss 2	31ca4227-94d1-43bf-990a-43a14b938609	2025-09-18 02:15:08.309+00	2025-09-18 04:17:08.887+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	https://fusehealthbucket.s3.us-east-2.amazonaws.com/clinic-logos/1758169025047-pexels-pixabay-53404.jpg
\.


--
-- TOC entry 4876 (class 0 OID 16766)
-- Dependencies: 225
-- Data for Name: TreatmentProducts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TreatmentProducts" (id, "deletedAt", dosage, "numberOfDoses", "nextDose", "productId", "treatmentId", "createdAt", "updatedAt") FROM stdin;
660e8400-e29b-41d4-a716-446655440001	\N	500 mg per infusion	8	2025-09-20 01:57:34.863+00	550e8400-e29b-41d4-a716-446655440001	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440002	\N	300 mg daily	30	2025-09-14 01:57:34.863+00	550e8400-e29b-41d4-a716-446655440002	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440003	\N	750 mg NAD+ + B-complex per infusion	6	2025-09-27 01:57:34.863+00	550e8400-e29b-41d4-a716-446655440003	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440004	\N	500 mg NAD+ + 2000 mg Glutathione per infusion	4	2025-10-04 01:57:34.863+00	550e8400-e29b-41d4-a716-446655440004	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440005	\N	50 mg per spray, 2 sprays daily	60	2025-09-14 01:57:34.863+00	550e8400-e29b-41d4-a716-446655440005	724eb0c4-54a3-447c-8814-de4c1060e77a	2025-09-13 01:57:34.863+00	2025-09-13 01:57:34.863+00
660e8400-e29b-41d4-a716-446655440101	\N	0.25–2 mg subcutaneous injection weekly	4	2025-09-23 02:48:03.079+00	550e8400-e29b-41d4-a716-446655440101	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440102	\N	2.4 mg subcutaneous injection weekly	4	2025-09-23 02:48:03.079+00	550e8400-e29b-41d4-a716-446655440102	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440103	\N	2.5–15 mg subcutaneous injection weekly	4	2025-09-23 02:48:03.079+00	550e8400-e29b-41d4-a716-446655440103	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440104	\N	3 mg subcutaneous injection daily	30	2025-09-17 02:48:03.079+00	550e8400-e29b-41d4-a716-446655440104	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440105	\N	32 mg Naltrexone + 360 mg Bupropion daily (divided doses)	30	2025-09-17 02:48:03.079+00	550e8400-e29b-41d4-a716-446655440105	ab27c09c-08ad-457c-8d9b-f1fd7cff42e0	2025-09-16 02:48:03.079+00	2025-09-16 02:48:03.079+00
660e8400-e29b-41d4-a716-446655440201	\N	0.25–2 mg subcutaneous injection weekly	4	2025-09-25 02:36:49.931+00	550e8400-e29b-41d4-a716-446655440201	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:36:49.931+00	2025-09-18 02:36:49.931+00
660e8400-e29b-41d4-a716-446655440202	\N	2.5–15 mg subcutaneous injection weekly	4	2025-09-25 02:36:49.931+00	550e8400-e29b-41d4-a716-446655440202	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:36:49.931+00	2025-09-18 02:36:49.931+00
660e8400-e29b-41d4-a716-446655440203	\N	3 mg subcutaneous injection daily	30	2025-09-19 02:36:49.931+00	550e8400-e29b-41d4-a716-446655440203	b689451f-db88-4c98-900e-df3dbcfebe2a	2025-09-18 02:36:49.931+00	2025-09-18 02:36:49.931+00
\.


--
-- TOC entry 4869 (class 0 OID 16506)
-- Dependencies: 218
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 4870 (class 0 OID 16707)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, "deletedAt", "firstName", "lastName", email, "passwordHash", dob, "phoneNumber", address, city, state, "zipCode", role, "lastLoginAt", "consentGivenAt", "emergencyContact", "createdAt", "updatedAt", "clinicId", "pharmacyPatientId", gender, allergies, diseases, medications, "deaNumber", "npiNumber", licenses, "pharmacyPhysicianId") FROM stdin;
63ab9a4a-ddd0-492b-9912-c7a731df19f4	\N	Agora	Vai	agoravaiguilherme@gmail.com	$2b$12$/x.Rp6e7Xblil7Hm1UEisuL/qx6gR0E0/OfG9ZLJ.JhfJBPGmeyf.	1988-07-14	5551234567	\N	\N	\N	\N	patient	2025-09-19 05:38:59.13+00	2025-09-12 03:07:17.457+00	\N	2025-09-12 03:07:17.458+00	2025-09-19 05:38:59.131+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	\N	\N	\N
31ca4227-94d1-43bf-990a-43a14b938609	\N	Daniel	Meursing	dmeursing@yahoo.com	$2b$12$Xwqfbpp7iH0ZD.A5kNteEePRr1.U1KnYF6LOzwOaWk/.he2e0WClC	1995-06-06	9095328622	\N	\N	\N	\N	doctor	2025-09-16 21:17:27.571+00	2025-09-16 04:11:02.5+00	\N	2025-09-16 04:11:02.501+00	2025-09-16 21:17:27.571+00	29e3985c-20cd-45a8-adf7-d6f4cdd21a15	\N	\N	\N	\N	\N	\N	\N	\N	\N
150e84b8-3680-4a9d-bc6f-cdc8a3cd05c0	\N	Guilherme	Marques	grrbm2@gmail.com	$2b$12$8sL.TmbXqyQCzs1i9vZwh.wOSMMs53I2A0GIEqls9jmddcs8.hX9e	1988-07-14	5551234567	\N	\N	\N	\N	doctor	2025-09-18 04:16:02.422+00	2025-09-12 03:04:52.884+00	\N	2025-09-12 03:04:52.886+00	2025-09-18 04:16:02.422+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	\N	\N	\N
f67562fc-11b9-4974-976a-61efe592d291	\N	Kale	Smith	iateyourkalechip@gmail.com	$2b$12$rlQlc////tVhfa6NrPTZX.yoZyu5vOVFNeUwKqbrb3L6pz4oWoQZC	2003-09-21	7062371480	\N	\N	\N	\N	patient	2025-09-15 23:08:54.816+00	2025-09-15 23:08:36.357+00	\N	2025-09-15 23:08:36.359+00	2025-09-15 23:08:54.816+00	6d70d9a1-f4f1-493e-b9d7-0c7ed9a17bf7	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 4443 (class 2606 OID 16868)
-- Name: Clinic Clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_pkey" PRIMARY KEY (id);


--
-- TOC entry 4445 (class 2606 OID 37721)
-- Name: Clinic Clinic_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key" UNIQUE (slug);


--
-- TOC entry 4447 (class 2606 OID 37719)
-- Name: Clinic Clinic_slug_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key1" UNIQUE (slug);


--
-- TOC entry 4449 (class 2606 OID 37709)
-- Name: Clinic Clinic_slug_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key10" UNIQUE (slug);


--
-- TOC entry 4451 (class 2606 OID 37635)
-- Name: Clinic Clinic_slug_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key11" UNIQUE (slug);


--
-- TOC entry 4453 (class 2606 OID 37637)
-- Name: Clinic Clinic_slug_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key12" UNIQUE (slug);


--
-- TOC entry 4455 (class 2606 OID 37631)
-- Name: Clinic Clinic_slug_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key13" UNIQUE (slug);


--
-- TOC entry 4457 (class 2606 OID 37563)
-- Name: Clinic Clinic_slug_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key14" UNIQUE (slug);


--
-- TOC entry 4459 (class 2606 OID 37629)
-- Name: Clinic Clinic_slug_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key15" UNIQUE (slug);


--
-- TOC entry 4461 (class 2606 OID 37565)
-- Name: Clinic Clinic_slug_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key16" UNIQUE (slug);


--
-- TOC entry 4463 (class 2606 OID 37627)
-- Name: Clinic Clinic_slug_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key17" UNIQUE (slug);


--
-- TOC entry 4465 (class 2606 OID 37567)
-- Name: Clinic Clinic_slug_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key18" UNIQUE (slug);


--
-- TOC entry 4467 (class 2606 OID 37625)
-- Name: Clinic Clinic_slug_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key19" UNIQUE (slug);


--
-- TOC entry 4469 (class 2606 OID 37723)
-- Name: Clinic Clinic_slug_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key2" UNIQUE (slug);


--
-- TOC entry 4471 (class 2606 OID 37571)
-- Name: Clinic Clinic_slug_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key20" UNIQUE (slug);


--
-- TOC entry 4473 (class 2606 OID 37623)
-- Name: Clinic Clinic_slug_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key21" UNIQUE (slug);


--
-- TOC entry 4475 (class 2606 OID 37573)
-- Name: Clinic Clinic_slug_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key22" UNIQUE (slug);


--
-- TOC entry 4477 (class 2606 OID 37713)
-- Name: Clinic Clinic_slug_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key23" UNIQUE (slug);


--
-- TOC entry 4479 (class 2606 OID 37621)
-- Name: Clinic Clinic_slug_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key24" UNIQUE (slug);


--
-- TOC entry 4481 (class 2606 OID 37619)
-- Name: Clinic Clinic_slug_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key25" UNIQUE (slug);


--
-- TOC entry 4483 (class 2606 OID 37575)
-- Name: Clinic Clinic_slug_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key26" UNIQUE (slug);


--
-- TOC entry 4485 (class 2606 OID 37577)
-- Name: Clinic Clinic_slug_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key27" UNIQUE (slug);


--
-- TOC entry 4487 (class 2606 OID 37617)
-- Name: Clinic Clinic_slug_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key28" UNIQUE (slug);


--
-- TOC entry 4489 (class 2606 OID 37579)
-- Name: Clinic Clinic_slug_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key29" UNIQUE (slug);


--
-- TOC entry 4491 (class 2606 OID 37725)
-- Name: Clinic Clinic_slug_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key3" UNIQUE (slug);


--
-- TOC entry 4493 (class 2606 OID 37581)
-- Name: Clinic Clinic_slug_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key30" UNIQUE (slug);


--
-- TOC entry 4495 (class 2606 OID 37615)
-- Name: Clinic Clinic_slug_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key31" UNIQUE (slug);


--
-- TOC entry 4497 (class 2606 OID 37583)
-- Name: Clinic Clinic_slug_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key32" UNIQUE (slug);


--
-- TOC entry 4499 (class 2606 OID 37613)
-- Name: Clinic Clinic_slug_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key33" UNIQUE (slug);


--
-- TOC entry 4501 (class 2606 OID 37585)
-- Name: Clinic Clinic_slug_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key34" UNIQUE (slug);


--
-- TOC entry 4503 (class 2606 OID 37611)
-- Name: Clinic Clinic_slug_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key35" UNIQUE (slug);


--
-- TOC entry 4505 (class 2606 OID 37561)
-- Name: Clinic Clinic_slug_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key36" UNIQUE (slug);


--
-- TOC entry 4507 (class 2606 OID 37609)
-- Name: Clinic Clinic_slug_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key37" UNIQUE (slug);


--
-- TOC entry 4509 (class 2606 OID 37587)
-- Name: Clinic Clinic_slug_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key38" UNIQUE (slug);


--
-- TOC entry 4511 (class 2606 OID 37607)
-- Name: Clinic Clinic_slug_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key39" UNIQUE (slug);


--
-- TOC entry 4513 (class 2606 OID 37717)
-- Name: Clinic Clinic_slug_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key4" UNIQUE (slug);


--
-- TOC entry 4515 (class 2606 OID 37589)
-- Name: Clinic Clinic_slug_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key40" UNIQUE (slug);


--
-- TOC entry 4517 (class 2606 OID 37591)
-- Name: Clinic Clinic_slug_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key41" UNIQUE (slug);


--
-- TOC entry 4519 (class 2606 OID 37605)
-- Name: Clinic Clinic_slug_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key42" UNIQUE (slug);


--
-- TOC entry 4521 (class 2606 OID 37603)
-- Name: Clinic Clinic_slug_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key43" UNIQUE (slug);


--
-- TOC entry 4523 (class 2606 OID 37593)
-- Name: Clinic Clinic_slug_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key44" UNIQUE (slug);


--
-- TOC entry 4525 (class 2606 OID 37601)
-- Name: Clinic Clinic_slug_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key45" UNIQUE (slug);


--
-- TOC entry 4527 (class 2606 OID 37595)
-- Name: Clinic Clinic_slug_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key46" UNIQUE (slug);


--
-- TOC entry 4529 (class 2606 OID 37597)
-- Name: Clinic Clinic_slug_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key47" UNIQUE (slug);


--
-- TOC entry 4531 (class 2606 OID 37707)
-- Name: Clinic Clinic_slug_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key48" UNIQUE (slug);


--
-- TOC entry 4533 (class 2606 OID 37639)
-- Name: Clinic Clinic_slug_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key49" UNIQUE (slug);


--
-- TOC entry 4535 (class 2606 OID 37715)
-- Name: Clinic Clinic_slug_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key5" UNIQUE (slug);


--
-- TOC entry 4537 (class 2606 OID 37705)
-- Name: Clinic Clinic_slug_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key50" UNIQUE (slug);


--
-- TOC entry 4539 (class 2606 OID 37703)
-- Name: Clinic Clinic_slug_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key51" UNIQUE (slug);


--
-- TOC entry 4541 (class 2606 OID 37701)
-- Name: Clinic Clinic_slug_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key52" UNIQUE (slug);


--
-- TOC entry 4543 (class 2606 OID 37699)
-- Name: Clinic Clinic_slug_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key53" UNIQUE (slug);


--
-- TOC entry 4545 (class 2606 OID 37641)
-- Name: Clinic Clinic_slug_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key54" UNIQUE (slug);


--
-- TOC entry 4547 (class 2606 OID 37697)
-- Name: Clinic Clinic_slug_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key55" UNIQUE (slug);


--
-- TOC entry 4549 (class 2606 OID 37643)
-- Name: Clinic Clinic_slug_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key56" UNIQUE (slug);


--
-- TOC entry 4551 (class 2606 OID 37695)
-- Name: Clinic Clinic_slug_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key57" UNIQUE (slug);


--
-- TOC entry 4553 (class 2606 OID 37645)
-- Name: Clinic Clinic_slug_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key58" UNIQUE (slug);


--
-- TOC entry 4555 (class 2606 OID 37693)
-- Name: Clinic Clinic_slug_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key59" UNIQUE (slug);


--
-- TOC entry 4557 (class 2606 OID 37727)
-- Name: Clinic Clinic_slug_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key6" UNIQUE (slug);


--
-- TOC entry 4559 (class 2606 OID 37691)
-- Name: Clinic Clinic_slug_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key60" UNIQUE (slug);


--
-- TOC entry 4561 (class 2606 OID 37647)
-- Name: Clinic Clinic_slug_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key61" UNIQUE (slug);


--
-- TOC entry 4563 (class 2606 OID 37689)
-- Name: Clinic Clinic_slug_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key62" UNIQUE (slug);


--
-- TOC entry 4565 (class 2606 OID 37687)
-- Name: Clinic Clinic_slug_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key63" UNIQUE (slug);


--
-- TOC entry 4567 (class 2606 OID 37685)
-- Name: Clinic Clinic_slug_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key64" UNIQUE (slug);


--
-- TOC entry 4569 (class 2606 OID 37649)
-- Name: Clinic Clinic_slug_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key65" UNIQUE (slug);


--
-- TOC entry 4571 (class 2606 OID 37683)
-- Name: Clinic Clinic_slug_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key66" UNIQUE (slug);


--
-- TOC entry 4573 (class 2606 OID 37599)
-- Name: Clinic Clinic_slug_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key67" UNIQUE (slug);


--
-- TOC entry 4575 (class 2606 OID 37681)
-- Name: Clinic Clinic_slug_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key68" UNIQUE (slug);


--
-- TOC entry 4577 (class 2606 OID 37679)
-- Name: Clinic Clinic_slug_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key69" UNIQUE (slug);


--
-- TOC entry 4579 (class 2606 OID 37711)
-- Name: Clinic Clinic_slug_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key7" UNIQUE (slug);


--
-- TOC entry 4581 (class 2606 OID 37677)
-- Name: Clinic Clinic_slug_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key70" UNIQUE (slug);


--
-- TOC entry 4583 (class 2606 OID 37569)
-- Name: Clinic Clinic_slug_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key71" UNIQUE (slug);


--
-- TOC entry 4585 (class 2606 OID 37675)
-- Name: Clinic Clinic_slug_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key72" UNIQUE (slug);


--
-- TOC entry 4587 (class 2606 OID 37651)
-- Name: Clinic Clinic_slug_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key73" UNIQUE (slug);


--
-- TOC entry 4589 (class 2606 OID 37673)
-- Name: Clinic Clinic_slug_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key74" UNIQUE (slug);


--
-- TOC entry 4591 (class 2606 OID 37653)
-- Name: Clinic Clinic_slug_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key75" UNIQUE (slug);


--
-- TOC entry 4593 (class 2606 OID 37671)
-- Name: Clinic Clinic_slug_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key76" UNIQUE (slug);


--
-- TOC entry 4595 (class 2606 OID 37669)
-- Name: Clinic Clinic_slug_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key77" UNIQUE (slug);


--
-- TOC entry 4597 (class 2606 OID 37667)
-- Name: Clinic Clinic_slug_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key78" UNIQUE (slug);


--
-- TOC entry 4599 (class 2606 OID 37665)
-- Name: Clinic Clinic_slug_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key79" UNIQUE (slug);


--
-- TOC entry 4601 (class 2606 OID 37729)
-- Name: Clinic Clinic_slug_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key8" UNIQUE (slug);


--
-- TOC entry 4603 (class 2606 OID 37663)
-- Name: Clinic Clinic_slug_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key80" UNIQUE (slug);


--
-- TOC entry 4605 (class 2606 OID 37655)
-- Name: Clinic Clinic_slug_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key81" UNIQUE (slug);


--
-- TOC entry 4607 (class 2606 OID 37661)
-- Name: Clinic Clinic_slug_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key82" UNIQUE (slug);


--
-- TOC entry 4609 (class 2606 OID 37659)
-- Name: Clinic Clinic_slug_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key83" UNIQUE (slug);


--
-- TOC entry 4611 (class 2606 OID 37657)
-- Name: Clinic Clinic_slug_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key84" UNIQUE (slug);


--
-- TOC entry 4613 (class 2606 OID 37559)
-- Name: Clinic Clinic_slug_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key85" UNIQUE (slug);


--
-- TOC entry 4615 (class 2606 OID 37731)
-- Name: Clinic Clinic_slug_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key86" UNIQUE (slug);


--
-- TOC entry 4617 (class 2606 OID 37557)
-- Name: Clinic Clinic_slug_key87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key87" UNIQUE (slug);


--
-- TOC entry 4619 (class 2606 OID 37633)
-- Name: Clinic Clinic_slug_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_slug_key9" UNIQUE (slug);


--
-- TOC entry 4427 (class 2606 OID 16721)
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- TOC entry 4663 (class 2606 OID 30761)
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 4629 (class 2606 OID 37994)
-- Name: Order Order_orderNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key" UNIQUE ("orderNumber");


--
-- TOC entry 4631 (class 2606 OID 37996)
-- Name: Order Order_orderNumber_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key1" UNIQUE ("orderNumber");


--
-- TOC entry 4633 (class 2606 OID 38004)
-- Name: Order Order_orderNumber_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key10" UNIQUE ("orderNumber");


--
-- TOC entry 4635 (class 2606 OID 37982)
-- Name: Order Order_orderNumber_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key11" UNIQUE ("orderNumber");


--
-- TOC entry 4637 (class 2606 OID 38006)
-- Name: Order Order_orderNumber_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key12" UNIQUE ("orderNumber");


--
-- TOC entry 4639 (class 2606 OID 37980)
-- Name: Order Order_orderNumber_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key13" UNIQUE ("orderNumber");


--
-- TOC entry 4641 (class 2606 OID 38008)
-- Name: Order Order_orderNumber_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key14" UNIQUE ("orderNumber");


--
-- TOC entry 4643 (class 2606 OID 37978)
-- Name: Order Order_orderNumber_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key15" UNIQUE ("orderNumber");


--
-- TOC entry 4645 (class 2606 OID 37992)
-- Name: Order Order_orderNumber_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key2" UNIQUE ("orderNumber");


--
-- TOC entry 4647 (class 2606 OID 37990)
-- Name: Order Order_orderNumber_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key3" UNIQUE ("orderNumber");


--
-- TOC entry 4649 (class 2606 OID 37998)
-- Name: Order Order_orderNumber_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key4" UNIQUE ("orderNumber");


--
-- TOC entry 4651 (class 2606 OID 37988)
-- Name: Order Order_orderNumber_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key5" UNIQUE ("orderNumber");


--
-- TOC entry 4653 (class 2606 OID 38000)
-- Name: Order Order_orderNumber_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key6" UNIQUE ("orderNumber");


--
-- TOC entry 4655 (class 2606 OID 38002)
-- Name: Order Order_orderNumber_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key7" UNIQUE ("orderNumber");


--
-- TOC entry 4657 (class 2606 OID 37986)
-- Name: Order Order_orderNumber_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key8" UNIQUE ("orderNumber");


--
-- TOC entry 4659 (class 2606 OID 37984)
-- Name: Order Order_orderNumber_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_orderNumber_key9" UNIQUE ("orderNumber");


--
-- TOC entry 4661 (class 2606 OID 30737)
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- TOC entry 4665 (class 2606 OID 30806)
-- Name: Payment Payment_orderId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_key" UNIQUE ("orderId");


--
-- TOC entry 4667 (class 2606 OID 30804)
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4669 (class 2606 OID 38066)
-- Name: Payment Payment_stripePaymentIntentId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4671 (class 2606 OID 38068)
-- Name: Payment Payment_stripePaymentIntentId_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key1" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4673 (class 2606 OID 38076)
-- Name: Payment Payment_stripePaymentIntentId_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key10" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4675 (class 2606 OID 38054)
-- Name: Payment Payment_stripePaymentIntentId_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key11" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4677 (class 2606 OID 38078)
-- Name: Payment Payment_stripePaymentIntentId_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key12" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4679 (class 2606 OID 38052)
-- Name: Payment Payment_stripePaymentIntentId_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key13" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4681 (class 2606 OID 38080)
-- Name: Payment Payment_stripePaymentIntentId_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key14" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4683 (class 2606 OID 38050)
-- Name: Payment Payment_stripePaymentIntentId_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key15" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4685 (class 2606 OID 38064)
-- Name: Payment Payment_stripePaymentIntentId_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key2" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4687 (class 2606 OID 38062)
-- Name: Payment Payment_stripePaymentIntentId_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key3" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4689 (class 2606 OID 38070)
-- Name: Payment Payment_stripePaymentIntentId_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key4" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4691 (class 2606 OID 38060)
-- Name: Payment Payment_stripePaymentIntentId_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key5" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4693 (class 2606 OID 38072)
-- Name: Payment Payment_stripePaymentIntentId_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key6" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4695 (class 2606 OID 38074)
-- Name: Payment Payment_stripePaymentIntentId_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key7" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4697 (class 2606 OID 38058)
-- Name: Payment Payment_stripePaymentIntentId_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key8" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4699 (class 2606 OID 38056)
-- Name: Payment Payment_stripePaymentIntentId_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_stripePaymentIntentId_key9" UNIQUE ("stripePaymentIntentId");


--
-- TOC entry 4435 (class 2606 OID 16753)
-- Name: PrescriptionProducts PrescriptionProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_pkey" PRIMARY KEY (id);


--
-- TOC entry 4437 (class 2606 OID 16755)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_productId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_productId_key" UNIQUE ("prescriptionId", "productId");


--
-- TOC entry 4431 (class 2606 OID 16733)
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- TOC entry 4429 (class 2606 OID 16728)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 4627 (class 2606 OID 24386)
-- Name: QuestionOption QuestionOption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionOption"
    ADD CONSTRAINT "QuestionOption_pkey" PRIMARY KEY (id);


--
-- TOC entry 4625 (class 2606 OID 24374)
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- TOC entry 4623 (class 2606 OID 24337)
-- Name: QuestionnaireStep QuestionnaireStep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionnaireStep"
    ADD CONSTRAINT "QuestionnaireStep_pkey" PRIMARY KEY (id);


--
-- TOC entry 4621 (class 2606 OID 24325)
-- Name: Questionnaire Questionnaire_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_pkey" PRIMARY KEY (id);


--
-- TOC entry 4246 (class 2606 OID 16485)
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- TOC entry 4701 (class 2606 OID 30823)
-- Name: ShippingAddress ShippingAddress_orderId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_orderId_key" UNIQUE ("orderId");


--
-- TOC entry 4703 (class 2606 OID 30821)
-- Name: ShippingAddress ShippingAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY (id);


--
-- TOC entry 4439 (class 2606 OID 16770)
-- Name: TreatmentProducts TreatmentProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_pkey" PRIMARY KEY (id);


--
-- TOC entry 4441 (class 2606 OID 16772)
-- Name: TreatmentProducts TreatmentProducts_productId_treatmentId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_productId_treatmentId_key" UNIQUE ("productId", "treatmentId");


--
-- TOC entry 4433 (class 2606 OID 16743)
-- Name: Treatment Treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4249 (class 2606 OID 16512)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 4251 (class 2606 OID 37769)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4253 (class 2606 OID 37763)
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- TOC entry 4255 (class 2606 OID 37753)
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- TOC entry 4257 (class 2606 OID 37803)
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- TOC entry 4259 (class 2606 OID 37743)
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- TOC entry 4261 (class 2606 OID 37825)
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- TOC entry 4263 (class 2606 OID 37831)
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- TOC entry 4265 (class 2606 OID 37741)
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- TOC entry 4267 (class 2606 OID 37835)
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- TOC entry 4269 (class 2606 OID 37791)
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- TOC entry 4271 (class 2606 OID 37841)
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- TOC entry 4273 (class 2606 OID 37739)
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- TOC entry 4275 (class 2606 OID 37789)
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- TOC entry 4277 (class 2606 OID 37845)
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- TOC entry 4279 (class 2606 OID 37737)
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- TOC entry 4281 (class 2606 OID 37847)
-- Name: users users_email_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key22 UNIQUE (email);


--
-- TOC entry 4283 (class 2606 OID 37897)
-- Name: users users_email_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key23 UNIQUE (email);


--
-- TOC entry 4285 (class 2606 OID 37849)
-- Name: users users_email_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key24 UNIQUE (email);


--
-- TOC entry 4287 (class 2606 OID 37799)
-- Name: users users_email_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key25 UNIQUE (email);


--
-- TOC entry 4289 (class 2606 OID 37895)
-- Name: users users_email_key26; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key26 UNIQUE (email);


--
-- TOC entry 4291 (class 2606 OID 37843)
-- Name: users users_email_key27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key27 UNIQUE (email);


--
-- TOC entry 4293 (class 2606 OID 37777)
-- Name: users users_email_key28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key28 UNIQUE (email);


--
-- TOC entry 4295 (class 2606 OID 37893)
-- Name: users users_email_key29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key29 UNIQUE (email);


--
-- TOC entry 4297 (class 2606 OID 37793)
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- TOC entry 4299 (class 2606 OID 37891)
-- Name: users users_email_key30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key30 UNIQUE (email);


--
-- TOC entry 4301 (class 2606 OID 37779)
-- Name: users users_email_key31; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key31 UNIQUE (email);


--
-- TOC entry 4303 (class 2606 OID 37781)
-- Name: users users_email_key32; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key32 UNIQUE (email);


--
-- TOC entry 4305 (class 2606 OID 37783)
-- Name: users users_email_key33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key33 UNIQUE (email);


--
-- TOC entry 4307 (class 2606 OID 37823)
-- Name: users users_email_key34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key34 UNIQUE (email);


--
-- TOC entry 4309 (class 2606 OID 37805)
-- Name: users users_email_key35; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key35 UNIQUE (email);


--
-- TOC entry 4311 (class 2606 OID 37807)
-- Name: users users_email_key36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key36 UNIQUE (email);


--
-- TOC entry 4313 (class 2606 OID 37809)
-- Name: users users_email_key37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key37 UNIQUE (email);


--
-- TOC entry 4315 (class 2606 OID 37821)
-- Name: users users_email_key38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key38 UNIQUE (email);


--
-- TOC entry 4317 (class 2606 OID 37811)
-- Name: users users_email_key39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key39 UNIQUE (email);


--
-- TOC entry 4319 (class 2606 OID 37795)
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- TOC entry 4321 (class 2606 OID 37819)
-- Name: users users_email_key40; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key40 UNIQUE (email);


--
-- TOC entry 4323 (class 2606 OID 37899)
-- Name: users users_email_key41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key41 UNIQUE (email);


--
-- TOC entry 4325 (class 2606 OID 37815)
-- Name: users users_email_key42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key42 UNIQUE (email);


--
-- TOC entry 4327 (class 2606 OID 37813)
-- Name: users users_email_key43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key43 UNIQUE (email);


--
-- TOC entry 4329 (class 2606 OID 37827)
-- Name: users users_email_key44; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key44 UNIQUE (email);


--
-- TOC entry 4331 (class 2606 OID 37907)
-- Name: users users_email_key45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key45 UNIQUE (email);


--
-- TOC entry 4333 (class 2606 OID 37905)
-- Name: users users_email_key46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key46 UNIQUE (email);


--
-- TOC entry 4335 (class 2606 OID 37901)
-- Name: users users_email_key47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key47 UNIQUE (email);


--
-- TOC entry 4337 (class 2606 OID 37903)
-- Name: users users_email_key48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key48 UNIQUE (email);


--
-- TOC entry 4339 (class 2606 OID 37771)
-- Name: users users_email_key49; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key49 UNIQUE (email);


--
-- TOC entry 4341 (class 2606 OID 37761)
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- TOC entry 4343 (class 2606 OID 37851)
-- Name: users users_email_key50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key50 UNIQUE (email);


--
-- TOC entry 4345 (class 2606 OID 37883)
-- Name: users users_email_key51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key51 UNIQUE (email);


--
-- TOC entry 4347 (class 2606 OID 37837)
-- Name: users users_email_key52; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key52 UNIQUE (email);


--
-- TOC entry 4349 (class 2606 OID 37863)
-- Name: users users_email_key53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key53 UNIQUE (email);


--
-- TOC entry 4351 (class 2606 OID 37881)
-- Name: users users_email_key54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key54 UNIQUE (email);


--
-- TOC entry 4353 (class 2606 OID 37869)
-- Name: users users_email_key55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key55 UNIQUE (email);


--
-- TOC entry 4355 (class 2606 OID 37879)
-- Name: users users_email_key56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key56 UNIQUE (email);


--
-- TOC entry 4357 (class 2606 OID 37871)
-- Name: users users_email_key57; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key57 UNIQUE (email);


--
-- TOC entry 4359 (class 2606 OID 37877)
-- Name: users users_email_key58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key58 UNIQUE (email);


--
-- TOC entry 4361 (class 2606 OID 37873)
-- Name: users users_email_key59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key59 UNIQUE (email);


--
-- TOC entry 4363 (class 2606 OID 37797)
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- TOC entry 4365 (class 2606 OID 37865)
-- Name: users users_email_key60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key60 UNIQUE (email);


--
-- TOC entry 4367 (class 2606 OID 37867)
-- Name: users users_email_key61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key61 UNIQUE (email);


--
-- TOC entry 4369 (class 2606 OID 37817)
-- Name: users users_email_key62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key62 UNIQUE (email);


--
-- TOC entry 4371 (class 2606 OID 37767)
-- Name: users users_email_key63; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key63 UNIQUE (email);


--
-- TOC entry 4373 (class 2606 OID 37765)
-- Name: users users_email_key64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key64 UNIQUE (email);


--
-- TOC entry 4375 (class 2606 OID 37889)
-- Name: users users_email_key65; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key65 UNIQUE (email);


--
-- TOC entry 4377 (class 2606 OID 37885)
-- Name: users users_email_key66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key66 UNIQUE (email);


--
-- TOC entry 4379 (class 2606 OID 37887)
-- Name: users users_email_key67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key67 UNIQUE (email);


--
-- TOC entry 4381 (class 2606 OID 37875)
-- Name: users users_email_key68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key68 UNIQUE (email);


--
-- TOC entry 4383 (class 2606 OID 37759)
-- Name: users users_email_key69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key69 UNIQUE (email);


--
-- TOC entry 4385 (class 2606 OID 37757)
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- TOC entry 4387 (class 2606 OID 37853)
-- Name: users users_email_key70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key70 UNIQUE (email);


--
-- TOC entry 4389 (class 2606 OID 37861)
-- Name: users users_email_key71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key71 UNIQUE (email);


--
-- TOC entry 4391 (class 2606 OID 37855)
-- Name: users users_email_key72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key72 UNIQUE (email);


--
-- TOC entry 4393 (class 2606 OID 37859)
-- Name: users users_email_key73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key73 UNIQUE (email);


--
-- TOC entry 4395 (class 2606 OID 37857)
-- Name: users users_email_key74; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key74 UNIQUE (email);


--
-- TOC entry 4397 (class 2606 OID 37773)
-- Name: users users_email_key75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key75 UNIQUE (email);


--
-- TOC entry 4399 (class 2606 OID 37775)
-- Name: users users_email_key76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key76 UNIQUE (email);


--
-- TOC entry 4401 (class 2606 OID 37829)
-- Name: users users_email_key77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key77 UNIQUE (email);


--
-- TOC entry 4403 (class 2606 OID 37833)
-- Name: users users_email_key78; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key78 UNIQUE (email);


--
-- TOC entry 4405 (class 2606 OID 37787)
-- Name: users users_email_key79; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key79 UNIQUE (email);


--
-- TOC entry 4407 (class 2606 OID 37755)
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- TOC entry 4409 (class 2606 OID 37785)
-- Name: users users_email_key80; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key80 UNIQUE (email);


--
-- TOC entry 4411 (class 2606 OID 37751)
-- Name: users users_email_key81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key81 UNIQUE (email);


--
-- TOC entry 4413 (class 2606 OID 37745)
-- Name: users users_email_key82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key82 UNIQUE (email);


--
-- TOC entry 4415 (class 2606 OID 37839)
-- Name: users users_email_key83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key83 UNIQUE (email);


--
-- TOC entry 4417 (class 2606 OID 37749)
-- Name: users users_email_key84; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key84 UNIQUE (email);


--
-- TOC entry 4419 (class 2606 OID 37747)
-- Name: users users_email_key85; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key85 UNIQUE (email);


--
-- TOC entry 4421 (class 2606 OID 37735)
-- Name: users users_email_key86; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key86 UNIQUE (email);


--
-- TOC entry 4423 (class 2606 OID 37801)
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- TOC entry 4425 (class 2606 OID 16714)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4247 (class 1259 OID 16513)
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_expire ON public.session USING btree (expire);


--
-- TOC entry 4719 (class 2606 OID 38032)
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4720 (class 2606 OID 38037)
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE;


--
-- TOC entry 4716 (class 2606 OID 38019)
-- Name: Order Order_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4717 (class 2606 OID 38014)
-- Name: Order Order_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE;


--
-- TOC entry 4718 (class 2606 OID 38009)
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 4721 (class 2606 OID 38042)
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4708 (class 2606 OID 37931)
-- Name: PrescriptionProducts PrescriptionProducts_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4709 (class 2606 OID 37936)
-- Name: PrescriptionProducts PrescriptionProducts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrescriptionProducts"
    ADD CONSTRAINT "PrescriptionProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4705 (class 2606 OID 37916)
-- Name: Prescription Prescription_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 4715 (class 2606 OID 37970)
-- Name: QuestionOption QuestionOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionOption"
    ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4714 (class 2606 OID 37965)
-- Name: Question Question_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public."QuestionnaireStep"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4713 (class 2606 OID 37958)
-- Name: QuestionnaireStep QuestionnaireStep_questionnaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionnaireStep"
    ADD CONSTRAINT "QuestionnaireStep_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES public."Questionnaire"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4712 (class 2606 OID 37951)
-- Name: Questionnaire Questionnaire_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Questionnaire"
    ADD CONSTRAINT "Questionnaire_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4722 (class 2606 OID 38087)
-- Name: ShippingAddress ShippingAddress_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4710 (class 2606 OID 37941)
-- Name: TreatmentProducts TreatmentProducts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4711 (class 2606 OID 37946)
-- Name: TreatmentProducts TreatmentProducts_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentProducts"
    ADD CONSTRAINT "TreatmentProducts_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4706 (class 2606 OID 37926)
-- Name: Treatment Treatment_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE;


--
-- TOC entry 4707 (class 2606 OID 37921)
-- Name: Treatment Treatment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- TOC entry 4704 (class 2606 OID 37911)
-- Name: users users_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2025-09-19 06:00:15 UTC

--
-- PostgreSQL database dump complete
--

