import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an expert SQL developer. Convert the following natural language into a SQL query. Only return the SQL query without any explanation or markdown formatting.

Available database tables and their structures:

1. users table:
   - id: SERIAL PRIMARY KEY
   - name: TEXT NOT NULL
   - email: TEXT UNIQUE NOT NULL
   - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. orders table:
   - id: SERIAL PRIMARY KEY
   - user_id: INTEGER REFERENCES users(id)
   - amount: DECIMAL(10,2)
   - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Example relationships:
- Each user can have multiple orders
- orders.user_id references users.id

Please generate SQL queries according to these table structures.`;

// 清理 SQL 查询中的 Markdown 标记
function cleanSqlQuery(sql: string): string {
  return sql
    .replace(/```sql\n?/g, '')  // 移除开头的 ```sql
    .replace(/```\n?/g, '')     // 移除结尾的 ```
    .trim();                    // 移除多余的空白
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    console.log('Sending request to OpenAI with prompt:', prompt);
    console.log('Using API URL:', process.env.OPENAI_API_BASE_URL);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!response.choices || !response.choices[0]?.message?.content) {
      console.error('Invalid response from OpenAI:', response);
      return new Response('Invalid response from AI service', { status: 500 });
    }

    const sqlQuery = cleanSqlQuery(response.choices[0].message.content);
    console.log('Generated SQL:', sqlQuery);
    
    return new Response(sqlQuery);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
    });
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate SQL query',
        details: err.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 