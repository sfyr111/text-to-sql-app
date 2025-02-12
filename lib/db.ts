import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

// 初始化表和数据
export async function initDatabase() {
  try {
    // 创建用户表
    await sql`
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS users;
      
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 创建订单表
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 插入示例数据
    await sql`
      INSERT INTO users (name, email)
      VALUES 
        ('John Doe', 'john@example.com'),
        ('Jane Smith', 'jane@example.com'),
        ('Bob Wilson', 'bob@example.com')
      ON CONFLICT (email) DO NOTHING;
    `;

    await sql`
      INSERT INTO orders (user_id, amount)
      VALUES 
        (1, 99.99),
        (1, 149.99),
        (2, 199.99)
      ON CONFLICT DO NOTHING;
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { sql }; 