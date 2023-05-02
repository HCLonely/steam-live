# steam live

Steam 直播挂机脚本。

## 使用

1. 安装依赖`npm install`;
2. 复制`.env.example`文件为`.env`文件;
3. 编辑`.env`文件，前三项(`SESSIONID`, `STEAMID`, `COOKIE`)可以打开要挂机的直播间，在控制台输入以下内容获取:

    ```javascript
    console.log(`SESSIONID: ${g_sessionID}
    STEAMID: ${window.location.pathname.split('/').at(-1)}
    COOKIE: ${document.cookie}
    `);
    ```

4. 运行`npm start`.
