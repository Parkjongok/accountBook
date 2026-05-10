import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. 최고 관리자 계정 생성
  const adminEmail = 'jowildpark@gmail.com';
  const adminPassword = await bcrypt.hash('admin1234', 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });
    console.log('✅ 관리자 계정이 성공적으로 생성되었습니다.');
    console.log(`- 아이디: ${adminEmail}`);
    console.log(`- 비밀번호: admin1234`);
  } else {
    console.log('ℹ️ 관리자 계정이 이미 존재합니다.');
  }

  // 2. 기본 가계부 카테고리 생성 (옵션)
  const existingCategory = await prisma.category.findFirst();
  
  if (!existingCategory) {
    const foodCategory = await prisma.category.create({
      data: { name: '식비' }
    });
    
    await prisma.category.create({
      data: { name: '교통비' }
    });

    // 2단계 카테고리 예시
    await prisma.category.create({
      data: { name: '외식비', parentId: foodCategory.id }
    });

    console.log('✅ 기본 카테고리가 생성되었습니다.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
