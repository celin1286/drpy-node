# 构建阶段
FROM node:14-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json文件
COPY package*.json ./

# 安装项目依赖项
RUN npm install

# 复制项目文件
COPY . .

# 运行构建脚本
RUN npm run build

# 运行阶段
FROM node:14-alpine

# 设置工作目录
WORKDIR /app

# 复制构建阶段的构建输出
COPY --from=builder /app /app

# 安装仅生产环境的依赖项
RUN npm install --only=production

# 暴露应用运行的端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
