import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// 모든 API에 인증 및 관리자 권한 미들웨어 적용
router.use(authenticateJWT, requireAdmin);

// === 사용자 관리 ===

// 사용자 목록 조회
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, groupId: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '사용자 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 사용자 그룹 지정
router.put('/users/:id/group', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { groupId } = req.body; // null 이면 그룹 해제

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { groupId: groupId ? Number(groupId) : null }
    });
    res.json({ message: '사용자 그룹이 업데이트 되었습니다.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: '사용자 그룹 업데이트 중 오류가 발생했습니다.' });
  }
});

// === 그룹 관리 ===

// 그룹 목록 조회
router.get('/groups', async (req: AuthRequest, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        users: { select: { id: true, email: true } }
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: '그룹 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 그룹 생성
router.post('/groups', async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  try {
    const group = await prisma.group.create({
      data: { name }
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: '그룹 생성 중 오류가 발생했습니다.' });
  }
});

// 그룹 삭제
router.delete('/groups/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    // 그룹에 속한 사용자들의 groupId를 null로 초기화
    await prisma.user.updateMany({
      where: { groupId: Number(id) },
      data: { groupId: null }
    });
    
    await prisma.group.delete({
      where: { id: Number(id) }
    });
    res.json({ message: '그룹이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '그룹 삭제 중 오류가 발생했습니다.' });
  }
});

// 사용자 상태 변경 (승인/거부)
router.put('/users/:id/status', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'APPROVED' or 'REJECTED'

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json({ message: '사용자 상태가 업데이트 되었습니다.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: '사용자 상태 업데이트 중 오류가 발생했습니다.' });
  }
});

// 사용자 비밀번호 초기화
import bcrypt from 'bcrypt';

router.put('/users/:id/reset-password', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const hashedResetPassword = await bcrypt.hash("123321!!", 10);
    
    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedResetPassword }
    });
    
    res.json({ message: '비밀번호가 성공적으로 초기화되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '비밀번호 초기화 중 오류가 발생했습니다.' });
  }
});

// === 카테고리 관리 ===

// 카테고리 생성
router.post('/categories', async (req: AuthRequest, res: Response) => {
  const { name, parentId } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        parentId: parentId ? Number(parentId) : null
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: '카테고리 생성 중 오류가 발생했습니다.' });
  }
});

// 카테고리 목록 조회 (계층 구조)
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // 1단계 카테고리만 먼저 가져옴
      include: {
        subCategories: true // 2단계 카테고리 포함
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 카테고리 수정
router.put('/categories/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, parentId } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        parentId: parentId ? Number(parentId) : null
      }
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: '카테고리 수정 중 오류가 발생했습니다.' });
  }
});

// 카테고리 삭제
router.delete('/categories/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    // 2단계 카테고리가 있는지 확인 후 함께 삭제 혹은 에러처리
    // 간단하게 하기 위해 Cascade 삭제 설정이 안되어있으므로 먼저 하위 카테고리 삭제 후 부모 삭제 필요
    await prisma.category.deleteMany({
      where: { parentId: Number(id) }
    });

    await prisma.category.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: '카테고리가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '카테고리 삭제 중 오류가 발생했습니다.' });
  }
});

// === 전체 입출금 내역 관리 ===

// 전체 내역 조회
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { email: true } },
        category: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: '가계부 내역을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 내역 삭제
router.delete('/transactions/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.transaction.delete({
      where: { id: Number(id) }
    });
    res.json({ message: '내역이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '내역 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
