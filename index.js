const fetch = require('node-fetch');
const FormData = require('form-data');
const HttpsProxyAgent = require('https-proxy-agent');
require('dotenv').config();

const INFO = {
  "sessionid": process.env.SESSIONID,
  "steamid": process.env.STEAMID,
  "cookie": process.env.COOKIE,
  "proxy": process.env.PROXY,
  "time": process.env.TIME
};

let time = -30;
const agent = INFO.proxy ? new HttpsProxyAgent(INFO.proxy) : null;

async function getbroadcastmpd() {
  console.log('正在获取直播间信息...');
  const data = await fetch(`https://steamcommunity.com/broadcast/getbroadcastmpd/?steamid=${INFO.steamid}&broadcastid=0&viewertoken=0&watchlocation=5&sessionid=${INFO.sessionid}`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      "Host": "steamcommunity.com",
      "cookie": INFO.cookie,
      "Referer": `https://steamcommunity.com/broadcast/watch/${INFO.steamid}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
    },
    agent: agent,
    "method": "GET"
  }).then((res) => res.json())
    .catch((error) => {
      console.log(error);
      return null;
    });

  if (data?.success === 'ready' && data.broadcastid) {
    console.log('直播间信息获取成功！');
    return data;
  }
  console.log('直播间信息获取失败！');
  return null;
}

async function heartbeat(info) {
  console.log('正在发送直播心跳...');

  const form = new FormData();
  form.append('steamid', INFO.steamid);
  form.append('broadcastid', info.broadcastid);
  form.append('viewertoken', info.viewertoken);

  const success = await fetch("https://steamcommunity.com/broadcast/heartbeat/", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      "sec-ch-ua": "\"Chromium\";v=\"112\", \"Microsoft Edge\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": INFO.cookie,
      "Referer": `https://steamcommunity.com/broadcast/watch/${INFO.steamid}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
    },
    agent: agent,
    "body": form,
    "method": "POST"
  }).then((res) => res.json())
    .then((json) => json.success === 1)
    .catch((error) => {
      console.log(error);
      return false;
    });
  console.log(`直播心跳发送${success ? '成功' : '失败'}！\n30s 后再次发送`);
  if (success) {
    time += 30;
  }

  await sleep(30 * 1000);

  if (time / 60 >= parseInt(INFO.time, 10)) {
    console.log('挂机完成，本次挂机共观看直播 ' + (time / 60).toFixed(0) + ' 分钟');
    return true;
  }

  heartbeat(info);
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  })
}
async function start() {
  const info = await getbroadcastmpd();
  if (!info) return null;

  heartbeat(info);
}
start();

/*
console.log(`SESSIONID: ${g_sessionID}
STEAMID: ${window.location.pathname.split('/').at(-1)}
COOKIE: ${document.cookie}
`);
*/
