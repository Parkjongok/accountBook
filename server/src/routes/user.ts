import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// 모든 API에 기본 인증 미들웨어 적용
router.use(authenticateJWT);

// === 카테고리 조회 (일반 사용자용) ===
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // 1단계 카테고리
      include: {
        subCategories: true // 2단계 카테고리
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// === 입출금 내역 관리 (일반 사용자용) ===

// 본인 및 같은 그룹 사용자의 전체 내역 조회
router.get('/transactions', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: '사용자 정보가 없습니다.' });
    return;
  }

  try {
    // 현재 사용자의 그룹 정보 조회
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { groupId: true }
    });

    let whereClause: any = { userId };

    // 그룹이 있다면 같은 그룹의 사용자들의 내역도 포함
    if (currentUser?.groupId) {
      whereClause = {
        user: {
          groupId: currentUser.groupId
        }
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
        user: { select: { name: true, email: true } } // 작성자 표시를 위해 이름과 이메일 포함
      },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: '가계부 내역을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 새로운 내역 추가
router.post('/transactions', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { categoryId, amount, type, date, memo } = req.body;

  if (!userId) {
    res.status(401).json({ error: '사용자 정보가 없습니다.' });
    return;
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId: Number(categoryId),
        amount: Number(amount),
        type, // 'INCOME' | 'EXPENSE'
        date: new Date(date),
        memo
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '내역 추가 중 오류가 발생했습니다.' });
  }
});

// 본인의 특정 내역 수정
router.put('/transactions/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { categoryId, amount, type, date, memo } = req.body;

  if (!userId) {
    res.status(401).json({ error: '사용자 정보가 없습니다.' });
    return;
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(id) }
    });

    if (!transaction) {
      res.status(404).json({ error: '내역을 찾을 수 없습니다.' });
      return;
    }

    if (transaction.userId !== userId) {
      res.status(403).json({ error: '이 내역을 수정할 권한이 없습니다.' });
      return;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: Number(id) },
      data: {
        categoryId: Number(categoryId),
        amount: Number(amount),
        type,
        date: new Date(date),
        memo
      }
    });
    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '내역 수정 중 오류가 발생했습니다.' });
  }
});

// 본인의 특정 내역 삭제
router.delete('/transactions/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ error: '사용자 정보가 없습니다.' });
    return;
  }

  try {
    // 먼저 해당 내역이 본인의 것인지 확인
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(id) }
    });

    if (!transaction) {
      res.status(404).json({ error: '내역을 찾을 수 없습니다.' });
      return;
    }

    if (transaction.userId !== userId) {
      res.status(403).json({ error: '이 내역을 삭제할 권한이 없습니다.' });
      return;
    }

    await prisma.transaction.delete({
      where: { id: Number(id) }
    });
    res.json({ message: '내역이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '내역 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
