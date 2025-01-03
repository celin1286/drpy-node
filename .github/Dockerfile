# 构建器阶段
FROM node:14-alpine AS builder

# 安装git和其他依赖
RUN apk add --no-cache git

# 创建一个工作目录
WORKDIR /app

# 克隆GitHub仓库到工作目录
RUN git clone https://github.com/hjdhnx/drpy-node.git .

# 更新npm
RUN npm install -g npm

# 全局安装yarn和pm2工具
RUN npm install -g yarn
RUN yarn global add pm2

# 安装项目依赖项和puppeteer
RUN yarn && yarn add puppeteer

# 复制工作目录中的所有文件到一个临时目录中
RUN mkdir /tmp/drpys && cp -r /app/* /tmp/drpys/

# 运行器阶段
FROM alpine:latest AS runner

# 安装Node.js运行时
RUN apk add --no-cache nodejs

# 创建一个工作目录
WORKDIR /app

# 复制构建器阶段中准备好的文件和依赖项到运行器阶段的工作目录中
COPY --from=builder /tmp/drpys /app

# 暴露应用程序端口
EXPOSE 5757

# 启动应用程序
CMD ["node", "index.js"]
