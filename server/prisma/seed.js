"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. 최고 관리자 계정 생성
        const adminEmail = 'jowildpark@gmail.com';
        const adminPassword = yield bcrypt_1.default.hash('admin1234', 10);
        const existingAdmin = yield prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (!existingAdmin) {
            yield prisma.user.create({
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
        }
        else {
            console.log('ℹ️ 관리자 계정이 이미 존재합니다.');
        }
        // 2. 기본 가계부 카테고리 생성 (옵션)
        const existingCategory = yield prisma.category.findFirst();
        if (!existingCategory) {
            const foodCategory = yield prisma.category.create({
                data: { name: '식비' }
            });
            yield prisma.category.create({
                data: { name: '교통비' }
            });
            // 2단계 카테고리 예시
            yield prisma.category.create({
                data: { name: '외식비', parentId: foodCategory.id }
            });
            console.log('✅ 기본 카테고리가 생성되었습니다.');
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
