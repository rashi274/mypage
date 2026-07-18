/**
 * Go-To-Market (GTM) & Clay Pipeline Simulator Logic
 * Integrated A/B Testing & Z-Test Statistical significance Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current Active Variant ('A' = Control, 'B' = Treatment)
    let activeVariant = 'A';

    // Variant Metrics (Tracked Independently)
    let visitorsA = 0;
    let leadsA = 0;
    let trialsA = 0;
    let paidA = 0;

    let visitorsB = 0;
    let leadsB = 0;
    let trialsB = 0;
    let paidB = 0;

    // Active User Context
    let currentEmail = '';
    let currentUserId = '';
    let userHasViewedPage = false;
    let userHasSignedUp = false;
    let userHasTrialed = false;
    let userHasUpgraded = false;

    // DOM Elements - Mock Browser & Variant Switcher
    const btnVariantA = document.getElementById('btn-variant-a');
    const btnVariantB = document.getElementById('btn-variant-b');
    const sfTagline = document.getElementById('sf-tagline');

    // DOM Elements - Action Buttons
    const btnPageview = document.getElementById('btn-pageview');
    const btnSignup = document.getElementById('btn-signup');
    const btnTrial = document.getElementById('btn-trial');
    const btnUpgrade = document.getElementById('btn-upgrade');
    const btnReset = document.getElementById('btn-reset-simulator');
    const inputEmail = document.getElementById('sf-email');
    
    const sfFormContainer = document.getElementById('sf-form-container');
    const sfStagesContainer = document.getElementById('sf-stages-container');
    const currentUserEmailSpan = document.getElementById('current-user-email');

    // Pipeline Nodes & Code Blocks
    const nodeDatalayer = document.getElementById('node-datalayer');
    const codeDatalayer = document.getElementById('code-datalayer');
    
    const nodeGtm = document.getElementById('node-gtm');
    const gtmTagsBox = document.getElementById('gtm-tags-box');
    
    const nodeClay = document.getElementById('node-clay');
    const claySpinner = document.getElementById('clay-spinner');
    const clayAwaiting = document.getElementById('clay-awaiting');
    const clayResults = document.getElementById('clay-results');
    
    const nodeCrm = document.getElementById('node-crm');
    const codeCrm = document.getElementById('code-crm');

    // Dashboard Widgets (Cumulative)
    const kpiVisitors = document.getElementById('kpi-visitors');
    const kpiLeads = document.getElementById('kpi-leads');
    const kpiMrr = document.getElementById('kpi-mrr');
    const kpiConversion = document.getElementById('kpi-conversion');

    // Funnel Bars
    const fVisitors = document.getElementById('f-visitors');
    const fLeads = document.getElementById('f-leads');
    const fTrials = document.getElementById('f-trials');
    const fPaid = document.getElementById('f-paid');

    const fvVisitors = document.getElementById('fv-visitors');
    const fvLeads = document.getElementById('fv-leads');
    const fvTrials = document.getElementById('fv-trials');
    const fvPaid = document.getElementById('fv-paid');

    // A/B Test Visual Chart Elements
    const abBarA = document.getElementById('ab-bar-a');
    const abBarB = document.getElementById('ab-bar-b');
    const abMetricsA = document.getElementById('ab-metrics-a');
    const abMetricsB = document.getElementById('ab-metrics-b');

    // Z-Test Verdict Card Elements
    const abVerdictCard = document.getElementById('ab-verdict-card');
    const verdictStatusBadge = document.getElementById('verdict-status-badge');
    const verdictLift = document.getElementById('verdict-lift');
    const verdictZscore = document.getElementById('verdict-zscore');
    const verdictPvalue = document.getElementById('verdict-pvalue');
    const verdictText = document.getElementById('verdict-text');

    /* ==========================================================================
       A/B Variant Switcher Logic
       ========================================================================== */
    btnVariantA.addEventListener('click', () => {
        if (userHasSignedUp && !userHasUpgraded) {
            alert("Please reset or finish the current user session before changing variations.");
            return;
        }
        activeVariant = 'A';
        btnVariantA.classList.add('active');
        btnVariantB.classList.remove('active');
        sfTagline.textContent = "Automate your business workflows in minutes.";
        resetUserSessionState();
    });

    btnVariantB.addEventListener('click', () => {
        if (userHasSignedUp && !userHasUpgraded) {
            alert("Please reset or finish the current user session before changing variations.");
            return;
        }
        activeVariant = 'B';
        btnVariantB.classList.add('active');
        btnVariantA.classList.remove('active');
        sfTagline.textContent = "Double your workflow productivity in 7 days or your money back! 🚀";
        resetUserSessionState();
    });

    /* ==========================================================================
       Z-Test Statistical Significance Engine (Data Analyst Core)
       ========================================================================== */
    function getPValue(z) {
        // Standard normal cumulative distribution function (two-tailed approximation)
        z = Math.abs(z);
        const t = 1 / (1 + 0.2316419 * z);
        const d = 0.3989423 * Math.exp(-z * z / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return Math.max(0, Math.min(1, 2 * p));
    }

    function calculateABTestSignificance() {
        const convRateA = visitorsA > 0 ? paidA / visitorsA : 0;
        const convRateB = visitorsB > 0 ? paidB / visitorsB : 0;

        // Visual charts rendering (percentage of bar width)
        const pctA = Math.round(convRateA * 100);
        const pctB = Math.round(convRateB * 100);
        abBarA.style.width = `${pctA}%`;
        abBarB.style.width = `${pctB}%`;
        abMetricsA.textContent = `${pctA}% (${paidA} / ${visitorsA})`;
        abMetricsB.textContent = `${pctB}% (${paidB} / ${visitorsB})`;

        // Check if we have sufficient samples to run a Z-Test
        if (visitorsA < 2 || visitorsB < 2 || (paidA === 0 && paidB === 0)) {
            verdictStatusBadge.textContent = "Awaiting Data";
            verdictStatusBadge.className = "verdict-badge neutral";
            verdictLift.textContent = "+0.0%";
            verdictZscore.textContent = "0.000";
            verdictPvalue.textContent = "1.000";
            verdictText.textContent = "Awaiting data. Please register at least 2 visitors and 1 conversion for both Variant A and Variant B to compute statistical significance.";
            return;
        }

        // 1. Calculate Lift
        let lift = 0;
        if (convRateA > 0) {
            lift = ((convRateB - convRateA) / convRateA) * 100;
        } else if (convRateB > 0) {
            lift = 100.0; // B has conversions but A has none
        }

        verdictLift.textContent = `${lift >= 0 ? '+' : ''}${lift.toFixed(1)}%`;

        // 2. Run Z-Test calculations
        const totalConversions = paidA + paidB;
        const totalVisitors = visitorsA + visitorsB;
        const pooledRate = totalConversions / totalVisitors;

        const se = Math.sqrt(pooledRate * (1 - pooledRate) * ((1 / visitorsA) + (1 / visitorsB)));
        
        let zScore = 0;
        if (se > 0) {
            zScore = (convRateB - convRateA) / se;
        }

        verdictZscore.textContent = zScore.toFixed(3);

        // 3. Find P-Value
        const pValue = getPValue(zScore);
        verdictPvalue.textContent = pValue.toFixed(4);

        // 4. Update UI Verdict Box based on Confidence level
        if (pValue < 0.05 && lift > 0) {
            verdictStatusBadge.textContent = "Significant";
            verdictStatusBadge.className = "verdict-badge significant";
            verdictText.innerHTML = `<strong>Success!</strong> The Treatment (Variant B) has achieved statistical significance (p = ${pValue.toFixed(4)} < 0.05). We are over 95% confident that the copy lift is real and not due to random chance. <span style="color:#10b981">Recommend deploying Variant B permanently.</span>`;
        } else if (pValue < 0.05 && lift < 0) {
            verdictStatusBadge.textContent = "Significant";
            verdictStatusBadge.className = "verdict-badge not-significant";
            verdictText.innerHTML = `<strong>Warning!</strong> Variant B (Treatment) performed significantly worse than Variant A (p = ${pValue.toFixed(4)} < 0.05). <span style="color:#ef4444">Recommend keeping Variant A (Control).</span>`;
        } else {
            verdictStatusBadge.textContent = "Not Significant";
            verdictStatusBadge.className = "verdict-badge neutral";
            verdictText.innerHTML = `No statistically significant difference detected (p = ${pValue.toFixed(4)} >= 0.05). The conversion lift of ${lift.toFixed(1)}% could be due to random chance. Continue running the test to accumulate more visitor sessions.`;
        }
    }

    /* ==========================================================================
       Dashboard Rendering & Cumulative Metrics
       ========================================================================== */
    function updateDashboard() {
        const cumulativeVisitors = visitorsA + visitorsB;
        const cumulativeLeads = leadsA + leadsB;
        const cumulativePaid = paidA + paidB;
        const cumulativeMRR = cumulativePaid * 79;
        const cumulativeTrials = trialsA + trialsB;

        kpiVisitors.textContent = cumulativeVisitors;
        kpiLeads.textContent = cumulativeLeads;
        kpiMrr.textContent = `$${cumulativeMRR}`;
        
        const conversion = cumulativeLeads > 0 ? Math.round((cumulativePaid / cumulativeLeads) * 100) : 0;
        kpiConversion.textContent = `${conversion}%`;

        // Update Funnel counts
        fvVisitors.textContent = cumulativeVisitors;
        fvLeads.textContent = cumulativeLeads;
        fvTrials.textContent = cumulativeTrials;
        fvPaid.textContent = cumulativePaid;

        // Calculate visual funnel widths
        if (cumulativeVisitors > 0) {
            fVisitors.style.width = '100%';
            fLeads.style.width = `${(cumulativeLeads / cumulativeVisitors) * 100}%`;
            fTrials.style.width = `${(cumulativeTrials / cumulativeVisitors) * 100}%`;
            fPaid.style.width = `${(cumulativePaid / cumulativeVisitors) * 100}%`;
        } else {
            fVisitors.style.width = '0%';
            fLeads.style.width = '0%';
            fTrials.style.width = '0%';
            fPaid.style.width = '0%';
        }

        // Run A/B statistical checks
        calculateABTestSignificance();
    }

    /* ==========================================================================
       GTM Tag Status Helper
       ========================================================================== */
    function fireGtmTags(tagsList) {
        gtmTagsBox.innerHTML = '';
        tagsList.forEach(tag => {
            const badge = document.createElement('span');
            badge.className = `tag-fired ${tag.class}`;
            badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${tag.name}`;
            gtmTagsBox.appendChild(badge);
        });
        nodeGtm.classList.add('active');
    }

    function resetPipelineDisplay() {
        nodeDatalayer.classList.remove('active');
        codeDatalayer.textContent = JSON.stringify({ "status": "Awaiting simulated user action..." }, null, 2);
        
        nodeGtm.classList.remove('active');
        gtmTagsBox.innerHTML = '<div class="tag-status awaiting">Awaiting GTM event...</div>';
        
        nodeClay.classList.remove('active');
        clayAwaiting.classList.remove('hidden');
        clayAwaiting.textContent = 'Awaiting signup to query Clay...';
        clayResults.classList.add('hidden');
        claySpinner.classList.add('hidden');
        
        nodeCrm.classList.remove('active');
        codeCrm.textContent = JSON.stringify({ "status": "Awaiting enriched profile..." }, null, 2);
    }

    function resetUserSessionState() {
        userHasViewedPage = false;
        userHasSignedUp = false;
        userHasTrialed = false;
        userHasUpgraded = false;
        
        // Reset Browser form elements
        inputEmail.value = 'aishwarya.tiwari@google.com';
        sfStagesContainer.classList.add('hidden');
        sfFormContainer.classList.remove('hidden');
        
        resetPipelineDisplay();
    }

    /* ==========================================================================
       SIMULATOR TRIGGER: Pageview
       ========================================================================== */
    btnPageview.addEventListener('click', () => {
        if (!userHasViewedPage) {
            if (activeVariant === 'A') visitorsA++;
            else visitorsB++;
            userHasViewedPage = true;
        }
        
        updateDashboard();
        resetPipelineDisplay();

        // 1. Data Layer Push (with A/B Test context)
        nodeDatalayer.classList.add('active');
        const dlPayload = {
            "event": "page_view",
            "page_path": "/",
            "page_title": activeVariant === 'A' ? "SaaSFlow Landing Page (Control)" : "SaaSFlow Landing Page (Treatment)",
            "anonymous_id": "anon_usr_8f430a",
            "context": {
                "ab_test_variant": activeVariant === 'A' ? "variant_a" : "variant_b"
            }
        };
        codeDatalayer.textContent = JSON.stringify(dlPayload, null, 2);

        // 2. GTM Tags Fire
        fireGtmTags([
            { name: "GA4 Pageview Tag", class: "ga4" },
            { name: "Facebook Pixel Pageview", class: "facebook" }
        ]);
    });

    /* ==========================================================================
       SIMULATOR TRIGGER: Lead Signup (Clay lookup triggers here!)
       ========================================================================== */
    btnSignup.addEventListener('click', () => {
        const email = inputEmail.value.trim();
        
        // Simple validation
        if (!email || email.indexOf('@') === -1) {
            alert('Please enter a valid email address.');
            return;
        }

        currentEmail = email;
        currentUserId = 'usr_' + Math.random().toString(36).substring(2, 9);
        
        // Ensure visitor count is updated if they skipped pageview button
        if (!userHasViewedPage) {
            if (activeVariant === 'A') visitorsA++;
            else visitorsB++;
            userHasViewedPage = true;
        }
        
        if (!userHasSignedUp) {
            if (activeVariant === 'A') leadsA++;
            else leadsB++;
            userHasSignedUp = true;
        }

        updateDashboard();
        resetPipelineDisplay();

        // Swap browser screens
        sfFormContainer.classList.add('hidden');
        sfStagesContainer.classList.remove('hidden');
        currentUserEmailSpan.textContent = currentEmail;

        // 1. Data Layer Push
        nodeDatalayer.classList.add('active');
        const dlPayload = {
            "event": "lead_signup",
            "user_id": currentUserId,
            "email": currentEmail,
            "signup_method": "direct_form",
            "context": {
                "ab_test_variant": activeVariant === 'A' ? "variant_a" : "variant_b"
            }
        };
        codeDatalayer.textContent = JSON.stringify(dlPayload, null, 2);

        // 2. GTM Tags Firing
        fireGtmTags([
            { name: "GA4 Lead Event", class: "ga4" },
            { name: "Google Ads Lead Tag", class: "googleads" },
            { name: "HubSpot Form Integration Webhook", class: "hubspot" }
        ]);

        // 3. Trigger Clay Lead Enrichment (Simulated API delay)
        nodeClay.classList.add('active');
        clayAwaiting.classList.add('hidden');
        claySpinner.classList.remove('hidden');

        // Extract domain
        const emailParts = currentEmail.split('@');
        const domain = emailParts.length === 2 ? emailParts[1].toLowerCase() : 'unknown';

        setTimeout(() => {
            claySpinner.classList.add('hidden');
            
            // Core GTM Lead Enrichment Database Mock
            let enrichedProfile = {
                name: "Alex Mercer",
                title: "Growth Marketing Specialist",
                company: "Startup Co.",
                industry: "SaaS & Software",
                size: "50 - 150 employees",
                linkedin: "linkedin.com/in/alex-mercer"
            };

            // Dynamic logic based on domain input (Recruiter easter eggs!)
            if (domain.includes('google')) {
                enrichedProfile = {
                    name: "Aishwarya Tiwari",
                    title: "Data Analyst / Growth Engineer",
                    company: "Google",
                    industry: "Artificial Intelligence & Cloud",
                    size: "100,000+ employees",
                    linkedin: "linkedin.com/in/your-username"
                };
            } else if (domain.includes('microsoft')) {
                enrichedProfile = {
                    name: "Satya Nadella",
                    title: "Chief Executive Officer",
                    company: "Microsoft",
                    industry: "Enterprise Software & Cloud",
                    size: "200,000+ employees",
                    linkedin: "linkedin.com/in/satya-nadella"
                };
            } else if (domain.includes('netflix')) {
                enrichedProfile = {
                    name: "Elizabeth Reed",
                    title: "Director of Product Management",
                    company: "Netflix",
                    industry: "Entertainment & Streaming",
                    size: "8,000+ employees",
                    linkedin: "linkedin.com/in/elizabeth-reed"
                };
            } else if (domain.includes('clay')) {
                enrichedProfile = {
                    name: "Barak Yachnin",
                    title: "GTM / Growth Engineering Lead",
                    company: "Clay",
                    industry: "Data Enrichment & Automation",
                    size: "100 - 250 employees",
                    linkedin: "linkedin.com/in/barak-yachnin"
                };
            } else {
                // Capitalize domain name for company
                const companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
                enrichedProfile.company = companyName;
                enrichedProfile.linkedin = `linkedin.com/in/alex-mercer-${domain.split('.')[0]}`;
            }

            // Render Clay output table
            document.getElementById('clay-name').textContent = enrichedProfile.name;
            document.getElementById('clay-title').textContent = enrichedProfile.title;
            document.getElementById('clay-company').textContent = enrichedProfile.company;
            document.getElementById('clay-industry').textContent = enrichedProfile.industry;
            document.getElementById('clay-size').textContent = enrichedProfile.size;
            
            const liLink = document.getElementById('clay-linkedin');
            liLink.href = 'https://' + enrichedProfile.linkedin;
            liLink.target = '_blank';
            liLink.textContent = enrichedProfile.linkedin;
            
            clayResults.classList.remove('hidden');

            // 4. Trigger HubSpot CRM Webhook Sync Payload (Visualizing output)
            nodeCrm.classList.add('active');
            const hsPayload = {
                "method": "POST",
                "endpoint": "https://api.hubapi.com/crm/v3/objects/contacts",
                "headers": {
                    "Authorization": "Bearer HS_PAT_XXXX",
                    "Content-Type": "application/json"
                },
                "body": {
                    "properties": {
                        "email": currentEmail,
                        "firstname": enrichedProfile.name.split(' ')[0],
                        "lastname": enrichedProfile.name.split(' ')[1] || '',
                        "jobtitle": enrichedProfile.title,
                        "company": enrichedProfile.company,
                        "linkedin_profile": enrichedProfile.linkedin,
                        "company_size": enrichedProfile.size,
                        "lead_source": "SaaSFlow Live Simulator",
                        "enriched_via_clay": "true",
                        "lead_score": "85",
                        "ab_test_variant": activeVariant === 'A' ? "variant_a" : "variant_b"
                    }
                }
            };
            codeCrm.textContent = JSON.stringify(hsPayload, null, 2);

        }, 900); // Simulated delay
    });

    /* ==========================================================================
       SIMULATOR TRIGGER: Start Free Trial
       ========================================================================== */
    btnTrial.addEventListener('click', () => {
        if (!userHasSignedUp) {
            alert('Please sign up first!');
            return;
        }

        if (!userHasTrialed) {
            if (activeVariant === 'A') trialsA++;
            else trialsB++;
            userHasTrialed = true;
        }

        updateDashboard();
        resetPipelineDisplay();

        // Reactivate nodes for context
        nodeDatalayer.classList.add('active');
        
        // 1. Data Layer Push
        const dlPayload = {
            "event": "trial_started",
            "user_id": currentUserId,
            "email": currentEmail,
            "trial_plan": "Enterprise Free Trial",
            "trial_duration_days": 14,
            "context": {
                "ab_test_variant": activeVariant === 'A' ? "variant_a" : "variant_b"
            }
        };
        codeDatalayer.textContent = JSON.stringify(dlPayload, null, 2);

        // 2. GTM Tags
        fireGtmTags([
            { name: "GA4 Trial Started Tag", class: "ga4" },
            { name: "Facebook Pixel Trial Event", class: "facebook" }
        ]);
    });

    /* ==========================================================================
       SIMULATOR TRIGGER: Upgrade to Premium
       ========================================================================== */
    btnUpgrade.addEventListener('click', () => {
        if (!userHasSignedUp) {
            alert('Please sign up first!');
            return;
        }

        if (!userHasUpgraded) {
            if (activeVariant === 'A') paidA++;
            else paidB++;
            userHasUpgraded = true;
            
            // Force trial if they bypassed the trial button
            if (!userHasTrialed) {
                if (activeVariant === 'A') trialsA++;
                else trialsB++;
                userHasTrialed = true;
            }
        }

        updateDashboard();
        resetPipelineDisplay();

        // 1. Data Layer Push
        nodeDatalayer.classList.add('active');
        const dlPayload = {
            "event": "subscription_upgraded",
            "user_id": currentUserId,
            "email": currentEmail,
            "subscription": {
                "plan_id": "premium_monthly",
                "plan_name": "Premium Pro Plan",
                "monthly_value": 79.00,
                "currency": "USD"
            },
            "context": {
                "ab_test_variant": activeVariant === 'A' ? "variant_a" : "variant_b"
            }
        };
        codeDatalayer.textContent = JSON.stringify(dlPayload, null, 2);

        // 2. GTM Tags
        fireGtmTags([
            { name: "GA4 Purchase Conversions", class: "ga4" },
            { name: "Facebook CAPI Subscription Fired", class: "facebook" },
            { name: "HubSpot Deal Won Event", class: "hubspot" }
        ]);
    });

    /* ==========================================================================
       RESET SIMULATOR SESSION
       ========================================================================== */
    btnReset.addEventListener('click', () => {
        resetUserSessionState();
    });

    /* ==========================================================================
       Code Library Toggling
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active classes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active classes
            button.classList.add('active');
            
            if (targetTab === 'dbt') {
                document.getElementById('tab-dbt').classList.add('active');
            } else if (targetTab === 'python') {
                document.getElementById('tab-python').classList.add('active');
            } else if (targetTab === 'gtm-code') {
                document.getElementById('tab-gtm-code').classList.add('active');
            }
        });
    });

    // Initialize Dashboard values
    updateDashboard();
});
