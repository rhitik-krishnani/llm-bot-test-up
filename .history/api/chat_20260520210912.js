    export default async function handler(req, res) {

    if(req.method !== "POST"){

        return res.status(405).json({
            error:"Method not allowed"
        });
    }

    const { message } = req.body;

    const SYSTEM_PROMPT = `
You are UPGB (Uttar Pradesh Gramin Bank) Smart Credit Assistant.

Rules:
- Reply in Hindi + English mix.
- Be concise but professional.
- Use HTML formatting.
- Only answer banking, loan, CIBIL, MSME, KCC and UPGB related queries.
- If unrelated, politely refuse by saying exactly:
This question is out of my scope, kindly ask questions related to banking, loan, CIBIL, MSME, KCC and UPGB related queries only.

Minimum CIBIL: 675
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