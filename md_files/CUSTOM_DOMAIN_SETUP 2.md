# Custom Domain Setup for Tenant Vanity Domains

## Overview
Enable tenants to use their own custom domains (e.g., `app.limitless.com`) with automated DNS verification and SSL.

## Current State - ALREADY WORKING!

✅ **Subdomain routing fully implemented:**
- Frontend extracts clinic from `app.limitless.com` → slug: `limitless.com`
- Calls `/clinic/by-slug/limitless.com` to load clinic data
- Works in dev: `limitless.localhost:3000`
- Works in prod: `app.limitless.com`
- CORS configured for `app.{domain}` patterns

✅ **What works now:**
- `app.fuse.health` → Shows Fuse clinic
- `limitless.fuse.health` → Shows Limitless clinic (slug-based)
- **Just needs DNS CNAME pointing to your server**

## What's Missing (Minimal!)

Only need to add:
1. Database fields to track custom domains
2. DNS verification endpoint  
3. Settings UI for domain setup

## Implementation Plan

### Phase 1: Database (3 Fields)

**Add to Clinic model:**

```typescript
customDomain?: string    // "limitless.com" (customer's domain)
domainVerified: boolean  // DNS check passed
verifiedAt?: Date        // When DNS was verified
```

**Migration:**
```sql
ALTER TABLE "Clinic" ADD COLUMN "customDomain" VARCHAR(255);
ALTER TABLE "Clinic" ADD COLUMN "domainVerified" BOOLEAN DEFAULT false;
ALTER TABLE "Clinic" ADD COLUMN "verifiedAt" TIMESTAMP;
```

### Phase 2: DNS Verification Service

**File:** `patient-api/src/services/domain.service.ts`

**CNAME Only** (no A records - avoid static IP issues):

```typescript
import { promises as dns } from 'dns';

class DomainService {
  async verifyCustomDomain(
    customDomain: string,
    expectedTarget: string = 'your-server.aptible.com'
  ): Promise<{ verified: boolean; error?: string }> {
    try {
      const hostname = `app.${customDomain}`;
      const records = await dns.resolveCname(hostname);
      
      const isValid = records.some(record => 
        record.toLowerCase() === expectedTarget.toLowerCase()
      );
      
      return {
        verified: isValid,
        error: isValid ? undefined : `CNAME not pointing to ${expectedTarget}`
      };
    } catch (error) {
      return {
        verified: false,
        error: 'CNAME record not found. Please add DNS record and try again.'
      };
    }
  }
}
```

### Phase 3: API Endpoints

**1. Setup Custom Domain**
```typescript
POST /clinic/custom-domain/setup
Body: { customDomain: "limitless.com" }

Returns:
{
  success: true,
  instructions: {
    type: "CNAME",
    host: "app.limitless.com",
    value: "your-server.aptible.com",
    ttl: 3600
  }
}
```

**2. Verify DNS**
```typescript
GET /clinic/custom-domain/verify

Returns:
{
  success: true,
  verified: true,
  message: "DNS verified! Your domain is now active."
}
```

**3. Get Status**
```typescript
GET /clinic/custom-domain/status

Returns:
{
  customDomain: "limitless.com",
  domainVerified: true,
  verifiedAt: "2025-10-17T10:30:00Z",
  fullUrl: "https://app.limitless.com"
}
```

**4. Remove Domain**
```typescript
DELETE /clinic/custom-domain

Returns:
{
  success: true,
  message: "Custom domain removed"
}
```

### Phase 4: Frontend UI (Settings Page)

**Custom Domain Section:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Custom Domain</CardTitle>
  </CardHeader>
  <CardContent>
    {!customDomain ? (
      // Setup Form
      <div>
        <Input 
          placeholder="limitless.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Your patient portal will be at: app.{domain || "yourdomain.com"}
        </p>
        <Button onClick={handleSetup}>
          Save & Generate Instructions
        </Button>
      </div>
    ) : !domainVerified ? (
      // DNS Instructions
      <div>
        <h3>Add this DNS record:</h3>
        <div className="p-4 bg-muted rounded">
          <div>Type: CNAME</div>
          <div>Host: app.{customDomain}</div>
          <div>Value: your-server.aptible.com</div>
          <div>TTL: 3600</div>
        </div>
        <Button onClick={handleVerify}>
          Check Verification
        </Button>
      </div>
    ) : (
      // Success State
      <div>
        <CheckCircle className="text-green-600" />
        <div>DNS Verified</div>
        <div>SSL Certificate Issued</div>
        <a href={`https://app.${customDomain}`}>
          Visit https://app.{customDomain}
        </a>
        <Button variant="outline" onClick={handleRemove}>
          Remove Domain
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

### Phase 5: Caddy Setup (Operations)

**Caddyfile** (on-demand TLS):

```
{
  on_demand_tls {
    ask http://localhost:3001/api/caddy/check-domain
  }
}

app.*.* {
  tls {
    on_demand
  }
  reverse_proxy localhost:3000
}
```

**Caddy Check Endpoint** (validates domain before issuing cert):

```typescript
app.get("/api/caddy/check-domain", async (req, res) => {
  const domain = req.query.domain; // app.limitless.com
  
  // Extract clinic domain
  const customDomain = domain.replace('app.', '');
  
  // Check if verified in database
  const clinic = await Clinic.findOne({
    where: { customDomain, domainVerified: true }
  });
  
  if (clinic) {
    res.status(200).send('OK'); // Allow Caddy to issue cert
  } else {
    res.status(403).send('Domain not verified');
  }
});
```

## Why CNAME Only?

**Advantages:**
- ✅ No static IP requirement
- ✅ Can change server/IP without customer action
- ✅ Simpler for customers to set up
- ✅ More flexible infrastructure

**Why NOT A records:**
- ❌ Requires static IP (never changes)
- ❌ If IP changes, all customer domains break
- ❌ No flexibility for server migrations
- ❌ More complex for customers

Since we're **NOT allowing root domain** usage (only `app.limitless.com`, not `limitless.com`), CNAME is perfect!

## Implementation Summary

**Code changes needed:**
1. Add 3 fields to Clinic model
2. Create DomainService with DNS verification
3. Add 4 API endpoints
4. Add Settings UI component
5. Add Caddy check endpoint

**Operations (not code):**
1. Set up Caddy reverse proxy
2. Configure on-demand TLS
3. Point Caddy to your app

**That's it!** Much simpler than original plan.

## Key Insights

- **SSL = Operational concern** (Caddy handles it, not your code)
- **X-Serve-For = Not needed** (frontend already handles routing)
- **A records = Skip entirely** (CNAME is superior for subdomains)
- **High availability = Operational** (load balancer + Caddy fleet)

## Next Steps

1. Answer: What's your Aptible/server endpoint for CNAME target?
2. Build: Database migration + API endpoints
3. Build: Settings UI
4. Docs: Caddy setup guide for operations team

