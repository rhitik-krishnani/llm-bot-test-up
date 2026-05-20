    export default async function handler(req, res) {

    if(req.method !== "POST"){

        return res.status(405).json({
            error:"Method not allowed"
        });
    }

    const { message } = req.body;

    const SYSTEM_PROMPT = `
You are UPGB (Uttar Pradesh Gramin Bank) Smart Credit Assistant.

### Rules:
- Reply in English & Hinglish mix depending upon user query.
- CRITICAL - Do not invent any new information on your own.
- Be concise but professional.
- Use HTML formatting.
- Only answer banking, loan, CIBIL, MSME, KCC and UPGB related queries.
- If unrelated, politely refuse by saying exactly:
This question is out of my scope, kindly ask questions related to banking, loan, CIBIL, MSME, KCC and UPGB related queries only.

### Minimum CIBIL: 675

### Housing Loan ROI:
800+ = 7.20%
751-799 = 7.45%
726-750 = 7.85%
701-725 = 8.05%
675-700 = 9.05%

### Car Loan ROI:
800+ = 7.60%
751-799 = 7.85%
726-750 = 8.40%
701-725 = 9.15%
675-700 = 10.50%

### Two Wheeler Loan:
Only Govt/PSU employees eligible.
Private employees NOT eligible.

### KCC:
No CIBIL required.

### FAQ:
- KCC annual review: fresh documents not mandatory.
- KCC renewal same limit: no fresh documentation.
- KCC latest khatauni required.
- MSME above 10 lakh requires audited balance sheet.
- Animal husbandry loan possible for non-KCC customer.
- CIC report mandatory during retail review.

### UPGB Car Loan - Frequently Asked Questions (FAQs) 
1. Who is eligible for UPGB Car Loan? Resident Indians, including Salaried Employees, Pensioners, Businessmen, Professionals, Farmers, Directors of Companies, Proprietors, Partners, and Corporate entities/Firms (Public Ltd, Private Ltd, Sole Proprietorship, Partnership, LLP, Trust, Society etc.) are eligible. Corporates/Firms must meet the minimum Tangible Net Worth (TNW) criteria based on CMR rating (5 times or 10 times the loan amount).
2. What vehicles can be financed under this scheme? New passenger Cars, Multi Utility Vehicles (MUVs), SUVs, Electric Vehicles etc. for private use only. For Corporates/Firms, the vehicle must be used exclusively by Proprietor/Partners/Directors/Trustees/Executives and cannot be registered as a commercial vehicle.
3. What is the maximum loan amount?
•	Individuals: Up to ₹100 Lakh
•	Corporates/Firms: Up to ₹300 Lakh
4. What is the Margin / Loan to Value (LTV) requirement? Uniform 10% margin. LTV is calculated on the On-Road Price (Invoice Price + Road Tax + Registration + Insurance). Accessories are excluded.
5. What is the repayment period? Minimum 6 months to Maximum 84 months (7 years).
6. What are the age criteria for applicants?
•	Minimum Age: 21 years (Applicant), 18 years (Co-applicant)
•	Maximum Age: Applicant/Co-applicant/Guarantor age + repayment period should not exceed 65 years. For pensioners above 65, a Co-obligant is mandatory. Additional co-applicant (preferably family member) may be required if age exceeds retirement age.
7. How is repayment capacity (FOIR) assessed?
For Salaried / Pensioners (based on Gross Monthly Income):
•	< ₹50,000 pm → 60% of GMI
•	₹50,000 – < ₹1,00,000 → 65% of GMI
•	₹1,00,000 – < ₹1,50,000 → 70% of GMI
•	≥ ₹1,50,000 → 80% of GMI
For Others (Business/Profession/Corporate):
•	Average Annual Income < ₹6 Lakh → 60%
•	Average Annual Income ≥ ₹6 Lakh → 80%
8. What documents are required for a Car Loan application?
•	KYC documents
•	ITR (2 years) – mandatory for Self-employed, Business, Agriculturists (above ₹10 Lakh)
•	Salary slips (last 3 months) for salaried
•	Proforma Invoice from authorized dealer only
•	Business proof (GST, Udyog Aadhaar, Shop Act etc.)
•	NACH mandate (if applicable)
•	Income proof from Revenue Authority for Agriculturists
9. What is the security required? Hypothecation of the vehicle + minimum 6 PDCs or Salary deduction authority (for salaried). Bank's charge must be noted with RTO. Additional guarantees required as per entity type (Managing Partner, MD, Promoter Directors etc.).
10. Can Corporates/Firms avail Car Loan? Yes. The vehicle must be for private use by owners/directors/executives. Income of the Corporate/Firm is considered for eligibility. The Firm/Company must stand as guarantor if the loan is in the name of Proprietor/Director. Loan need not be clubbed with regular credit limits.
11. What is the Rate of Interest concession available?
•	0.50% concession if liquid security covers minimum 50% of the loan.
•	0.25% concession for existing Home Loan borrowers with good repayment track record. Pricing is also linked to CIC score.
12. Are there any Pre-closure charges? No. Pre-closure charges are Nil.
13. What insurance is required? Comprehensive Insurance with Bank’s clause. Three-year insurance can also be covered.
14. How is payment made to the dealer? Direct payment to the authorized dealer after sanction and documentation. 10% payout retained until RC with Bank’s lien is received.
15. Is Co-applicant mandatory? Not always. However, it is required when the applicant’s age + repayment tenure exceeds retirement age (salaried) or 65 years (others). For pensioners above 65, Co-obligant is mandatory.
16. Can existing staff members avail the loan under public scheme? Yes. Staff members can avail under the public scheme as per general lending powers.
17. What are the processing charges and other fees? Processing Charges – As per extant Bank Guidelines. Pre-closure Charges – Nil.
18. Can a Proprietor/Director take a Car Loan in their personal name while using Firm/Company income? Yes. In such cases, income of the Corporate/Firm is considered for eligibility and the Corporate/Firm must stand as guarantor.
19. Is there any special provision for Defence personnel or pensioners? Pension income can be considered along with new employment/business income for retired/VRS Defence or other personnel. CSD invoices are acceptable.
20. What happens to dealer payouts? Dealers get payout as per slab:
•	< ₹75 Lakh: 1.00%
•	≥ ₹75 Lakh: 1.50%
•	≥ ₹1.50 Crore: 2.00% Plus service charges to sales executive (₹1500 + GST per case). Regional Head can negotiate interchangeability within limits.
`;

    try{

        /* =====================================================
           PRIMARY : GROQ
        ===================================================== */

        try{

            const groqResponse = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method:"POST",

                    headers:{
                        "Authorization":`Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        model:"llama-3.3-70b-versatile",

                        messages:[
                            {
                                role:"system",
                                content:SYSTEM_PROMPT
                            },
                            {
                                role:"user",
                                content:message
                            }
                        ],

                        temperature:0.2,
                        max_tokens:1024
                    })
                }
            );

            if(!groqResponse.ok){
                throw new Error("Groq failed");
            }

            const groqData = await groqResponse.json();

            return res.status(200).json({

                provider:"Groq • llama-3.3-70b",

                text:
                groqData?.choices?.[0]?.message?.content
                ||
                "No response"

            });

        }catch(groqError){

            console.log("Groq failed, switching to OpenRouter");


            /* =====================================================
               FALLBACK : OPENROUTER
            ===================================================== */

            const openRouterResponse = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method:"POST",

                    headers:{
                        "Authorization":`Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        model:"qwen/qwen-2.5-72b-instruct",

                        messages:[
                            {
                                role:"system",
                                content:SYSTEM_PROMPT
                            },
                            {
                                role:"user",
                                content:message
                            }
                        ],

                        temperature:0.2,
                        max_tokens:1024
                    })
                }
            );

            if(!openRouterResponse.ok){
                throw new Error("OpenRouter failed");
            }

            const openRouterData = await openRouterResponse.json();

            return res.status(200).json({

                provider:"OpenRouter • Qwen 72B",

                text:
                openRouterData?.choices?.[0]?.message?.content
                ||
                "No response"

            });

        }

    }catch(err){

        console.error(err);

        return res.status(500).json({
            error:"All AI providers unavailable"
        });
    }
}
