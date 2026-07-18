/**
 * Go-To-Market (GTM) & Clay Pipeline Simulator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Session State Metrics (Cumulative)
    let cumulativeVisitors = 0;
    let cumulativeLeads = 0;
    let cumulativeTrials = 0;
    let cumulativePaid = 0;
    let cumulativeMRR = 0;

    // Active User Context
    let currentEmail = '';
    let currentUserId = '';
    let userHasViewedPage = false;
    let userHasSignedUp = false;
    let userHasTrialed = false;
    let userHasUpgraded = false;

    // DOM Elements
    const btnPageview = document.getElementById('btn-pageview');
    const btnSignup = document.getElementById('btn-signup');
    const btnTrial = document.getElementById('btn-trial');
    const btnUpgrade = document.getElementById('btn-upgrade');
    const btnReset = document.getElementById('btn-reset-simulator');
    const inputEmail = document.getElementById('sf-email');
    
    const sfFormContainer = document.getElementById('sf-form-container');
    const sfStagesContainer = document.getElementById('sf-stages-container');
    const currentUserEmailSpan = document.getElementById('current-user-email');

    // Pipeline Nodes & Boxes
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

    // Dashboard widgets
    const kpiVisitors = document.getElementById('kpi-visitors');
    const kpiLeads = document.getElementById('kpi-leads');
    const kpiMrr = document.getElementById('kpi-mrr');
    const kpiConversion = document.getElementById('kpi-conversion');

    // Funnel bars & values
    const fVisitors = document.getElementById('f-visitors');
    const fLeads = document.getElementById('f-leads');
    const fTrials = document.getElementById('f-trials');
    const fPaid = document.getElementById('f-paid');

    const fvVisitors = document.getElementById('fv-visitors');
    const fvLeads = document.getElementById('fv-leads');
    const fvTrials = document.getElementById('fv-trials');
    const fvPaid = document.getElementById('fv-paid');

    /* ==========================================================================
       Dashboard Rendering & Calculations
       ========================================================================== */
    function updateDashboard() {
        kpiVisitors.textContent = cumulativeVisitors;
        kpiLeads.textContent = cumulativeLeads;
        kpiMrr.textContent = `$${cumulativeMRR}`;
        
        const conversion = cumulativeLeads > 0 ? Math.round((cumulativePaid / cumulativeLeads) * 100) : 0;
        kpiConversion.textContent = `${conversion}%`;

        // Update funnel counts
        fvVisitors.textContent = cumulativeVisitors;
        fvLeads.textContent = cumulativeLeads;
        fvTrials.textContent = cumulativeTrials;
        fvPaid.textContent = cumulativePaid;

        // Calculate and update funnel fills (percentages of total visitors)
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

    /* ==========================================================================
       SIMULATOR TRIGGER: Pageview
       ========================================================================== */
    btnPageview.addEventListener('click', () => {
        if (!userHasViewedPage) {
            cumulativeVisitors++;
            userHasViewedPage = true;
        }
        
        updateDashboard();
        resetPipelineDisplay();

        // 1. Data Layer Push
        nodeDatalayer.classList.add('active');
        const dlPayload = {
            "event": "page_view",
            "page_path": "/",
            "page_title": "SaaSFlow Landing Page",
            "anonymous_id": "anon_usr_8f430a"
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
            cumulativeVisitors++;
            userHasViewedPage = true;
        }
        
        if (!userHasSignedUp) {
            cumulativeLeads++;
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
            "signup_method": "direct_form"
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
                        "lead_score": "85"
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
            cumulativeTrials++;
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
            "trial_duration_days": 14
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
            cumulativePaid++;
            cumulativeMRR += 79;
            userHasUpgraded = true;
            // Force trial if they bypassed the trial button
            if (!userHasTrialed) {
                cumulativeTrials++;
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
        currentEmail = '';
        currentUserId = '';
        userHasViewedPage = false;
        userHasSignedUp = false;
        userHasTrialed = false;
        userHasUpgraded = false;
        
        // Reset Browser form elements
        inputEmail.value = 'aishwarya.tiwari@google.com';
        sfStagesContainer.classList.add('hidden');
        sfFormContainer.classList.remove('hidden');
        
        resetPipelineDisplay();
    });

    /* ==========================================================================
       Code Library Library Toggling
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
