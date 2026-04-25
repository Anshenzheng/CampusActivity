# 社团活动报名管理系统

一个基于 Angular + Spring Boot + MySQL 的校园社团活动报名管理系统，采用清新简洁的设计风格，富有青春活力。

## 技术栈

### 后端
- Spring Boot 3.2.0
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0+
- Apache POI (Excel导出)
- Lombok

### 前端
- Angular 17.0.0
- TypeScript 5.2
- RxJS 7.8

---

## 环境要求

确保你的开发环境已安装以下软件：

1. **JDK 17** 或更高版本
2. **Node.js 18** 或更高版本 (包含 npm)
3. **MySQL 8.0** 或更高版本
4. **Maven 3.8** 或更高版本 (或使用 Maven Wrapper)
5. **Angular CLI** (可选，用于开发)

---

## 快速开始

### 第一步：配置数据库

1. 启动 MySQL 服务

2. 创建数据库和表结构：

   方式一：手动执行 SQL 脚本
   ```sql
   -- 使用 MySQL 命令行或 Navicat 等工具执行
   source backend/src/main/resources/schema.sql
   ```

   方式二：让 JPA 自动创建（推荐）
   - 无需手动执行 SQL，启动后端服务时会自动创建表结构

3. 修改数据库连接配置（如有需要）：
   
   编辑 `backend/src/main/resources/application.yml` 文件：
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/campus_activity?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
       username: root          # 改为你的 MySQL 用户名
       password: root          # 改为你的 MySQL 密码
   ```

### 第二步：启动后端服务

1. 进入后端项目目录：
   ```bash
   cd backend
   ```

2. 使用 Maven 编译并运行：
   ```bash
   # 方式一：使用 Maven 命令
   mvn spring-boot:run
   
   # 方式二：先编译打包，再运行
   mvn clean package
   java -jar target/activity-1.0.0.jar
   ```

3. 验证后端启动成功：
   
   后端服务默认运行在 `http://localhost:8080`
   
   访问测试：
   - 健康检查：`http://localhost:8080/api/activities?page=0&size=10`
   - 首次访问会返回空列表，表示服务正常运行

### 第三步：启动前端服务

1. 进入前端项目目录：
   ```bash
   cd frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   ng serve
   # 或
   npm start
   ```

4. 验证前端启动成功：
   
   前端服务默认运行在 `http://localhost:4200`
   
   打开浏览器访问该地址，应该能看到活动列表页面。

---

## 功能验证

### 默认测试账户

系统启动后，你可以使用以下方式创建账户：

1. **注册新账户**：
   - 访问 `http://localhost:4200/register`
   - 填写信息注册，默认角色为普通成员

2. **创建管理员账户**：
   
   方式一：通过数据库修改
   ```sql
   -- 将某个用户的角色改为 ADMIN
   UPDATE users SET role = 'ADMIN' WHERE username = '你的用户名';
   ```

   方式二：注册时指定角色（需要修改代码或使用 API）
   ```bash
   # 使用 curl 命令创建管理员
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "admin123",
       "realName": "管理员",
       "email": "admin@campus.com",
       "phone": "13800138000",
       "role": "ADMIN"
     }'
   ```

### 功能测试流程

#### 1. 普通成员功能
- 注册/登录账户
- 浏览活动列表
- 查看活动详情
- 报名参加活动
- 查看我的报名记录及审核状态

#### 2. 管理员功能
- 发布新活动
- 编辑/删除活动
- 查看活动报名名单
- 审核报名（通过/拒绝）
- 查看报名统计数据
- 导出报名名单（Excel格式）
- 查看所有用户列表

### API 测试（可选）

使用 Postman 或 curl 测试后端 API：

1. **注册用户**：
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "123456",
       "realName": "测试用户",
       "email": "test@example.com",
       "phone": "13800000001",
       "role": "MEMBER"
     }'
   ```

2. **登录获取 Token**：
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "123456"
     }'
   ```
   
   保存返回的 `token`，后续请求需要使用。

3. **创建活动（需要管理员权限）**：
   ```bash
   curl -X POST http://localhost:8080/api/activities \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <你的token>" \
     -d '{
       "title": "社团招新活动",
       "description": "欢迎新同学加入我们的社团！",
       "startDate": "2025-06-01",
       "endDate": "2025-06-10",
       "location": "大学生活动中心",
       "maxParticipants": 50
     }'
   ```

4. **获取活动列表**（无需登录）：
   ```bash
   curl http://localhost:8080/api/activities?page=0&size=10
   ```

---

## 项目结构说明

```
CampusActivity/
├── backend/                    # 后端项目
│   ├── pom.xml                 # Maven 配置
│   └── src/main/
│       ├── java/com/campus/activity/
│       │   ├── CampusActivityApplication.java   # 启动类
│       │   ├── config/         # 配置类
│       │   ├── controller/     # 控制器
│       │   ├── dto/            # 数据传输对象
│       │   ├── entity/         # 实体类
│       │   ├── exception/      # 异常处理
│       │   ├── repository/     # 数据访问层
│       │   ├── security/       # 安全配置 (JWT)
│       │   └── service/        # 业务逻辑层
│       └── resources/
│           ├── application.yml # 应用配置
│           └── schema.sql      # 数据库脚本
│
└── frontend/                   # 前端项目
    ├── angular.json            # Angular 配置
    ├── package.json            # 依赖配置
    ├── tsconfig.json           # TypeScript 配置
    └── src/
        ├── app/
        │   ├── app.module.ts   # 主模块
        │   ├── app-routing.module.ts  # 路由配置
        │   ├── app.component.ts        # 根组件
        │   ├── components/     # 页面组件
        │   ├── models/         # 类型定义
        │   └── services/       # 服务层
        ├── index.html          # 入口 HTML
        ├── main.ts             # 入口文件
        └── styles.css          # 全局样式
```

---

## 常见问题

### 1. 数据库连接失败
- 检查 MySQL 服务是否启动
- 确认用户名和密码正确
- 确认数据库 `campus_activity` 已创建
- 检查 MySQL 端口是否为 3306

### 2. 前端无法访问后端 API
- 检查后端服务是否在 8080 端口运行
- 确认没有防火墙阻止连接
- 检查 CORS 配置（前端默认访问 localhost:4200）

### 3. JWT Token 失效
- Token 有效期为 24 小时，过期后需重新登录
- 确保请求头中包含正确的 `Authorization: Bearer <token>`

### 4. 前端依赖安装失败
- 尝试使用国内镜像：
  ```bash
  npm config set registry https://registry.npmmirror.com
  ```

---

## 开发建议

### 后端开发
- 使用 IntelliJ IDEA 打开 `backend` 目录
- 确保 JDK 17 已配置
- 运行 `CampusActivityApplication` 启动类

### 前端开发
- 使用 VS Code 打开 `frontend` 目录
- 安装 Angular 扩展：`Angular Language Service`
- 运行 `ng serve --open` 自动打开浏览器

### 数据库调试
- 可以使用 Navicat、DBeaver 或 MySQL Workbench 连接数据库
- 观察 `campus_activity` 数据库中的表结构和数据

---

## 功能特性总结

✅ **权限管理**
- 用户注册、登录、退出
- JWT Token 认证
- 角色权限区分（管理员/普通成员）

✅ **社团成员管理**
- 管理员可查看所有用户列表
- 用户信息展示（分页）

✅ **活动管理**
- 管理员发布、编辑、删除活动
- 普通成员浏览活动列表
- 活动详情展示
- 列表分页

✅ **报名功能**
- 普通成员在线报名
- 查看我的报名记录
- 报名状态显示（待审核/已通过/已拒绝）

✅ **报名审核**
- 管理员查看报名名单
- 审核通过/拒绝
- 查看统计数据
- 导出 Excel 名单

---

## 技术亮点

1. **安全认证**：JWT 无状态认证，支持跨域请求
2. **响应式设计**：适配移动端和桌面端
3. **分页查询**：所有列表均实现分页展示
4. **数据导出**：支持 Excel 格式导出报名数据
5. **清新风格**：采用紫色系和绿色系搭配，青春活力

---

如需进一步定制或遇到问题，请参考代码中的注释或联系开发人员。