# 使用Node.js官方镜像作为基础镜像
FROM node:14

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json文件
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 暴露应用运行的端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
