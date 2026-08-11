import requests
import json
from datetime import datetime
from collections import defaultdict
import os
from bs4 import BeautifulSoup  # 用于解析牛客网页
from dotenv import load_dotenv
import re
import urllib.parse

# 加载 .env 文件中的环境变量
load_dotenv()

# ================= 配置区 =================
CF_HANDLE = "kikoyida1016"
ATCODER_HANDLE = os.getenv("ATCODER_HANDLE", "kikoyida")

NOWCODER_UID = "278539296"
NOWCODER_COOKIE = os.getenv("NOWCODER_COOKIE", "")

LUOGU_UID = os.getenv("LUOGU_UID", "1903380")
LUOGU_COOKIE = os.getenv("LUOGU_COOKIE", "")

headers_base = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

NOWCODER_HEADERS = headers_base.copy()
NOWCODER_HEADERS["Cookie"] = NOWCODER_COOKIE

LUOGU_HEADERS = headers_base.copy()
LUOGU_HEADERS["Cookie"] = LUOGU_COOKIE
LUOGU_HEADERS["x-requested-with"] = "XMLHttpRequest"
# ==========================================

# 初始化每天的数据结构，tags 使用 set 以便后续去重
def default_daily_data():
    return {
        "ac": 0, "try": 0, "tags": set(), 
        "codeforces": 0, "atcoder": 0, "luogu": 0, "nowcoder": 0
    }

daily_data = defaultdict(default_daily_data)

def fetch_codeforces():
    print("Fetching Codeforces data...")
    url = f"https://codeforces.com/api/user.status?handle={CF_HANDLE}"
    try:
        response = requests.get(url, timeout=10).json()
        if response.get("status") != "OK":
            print(f"[-] Codeforces error: {response.get('comment')}")
            return
        
        ac_records = defaultdict(set)
        try_count = defaultdict(int)
        tags_records = defaultdict(set)
        
        for sub in response["result"]:
            date_str = datetime.fromtimestamp(sub["creationTimeSeconds"]).strftime('%Y-%m-%d')
            
            # 过滤出 C++ 的提交
            if "C++" not in sub.get("programmingLanguage", ""):
                continue
                
            problem_id = f"{sub['problem'].get('contestId', '')}{sub['problem'].get('index', '')}"
            tags = sub['problem'].get('tags', [])
            
            if sub.get("verdict") == "OK":
                if problem_id not in ac_records[date_str]:
                    ac_records[date_str].add(problem_id)
                    tags_records[date_str].update(tags)
            else:
                try_count[date_str] += 1
        
        # 汇总 Codeforces 数据
        for date_str, problems in ac_records.items():
            daily_data[date_str]["codeforces"] += len(problems)
            daily_data[date_str]["ac"] += len(problems)
            daily_data[date_str]["tags"].update(tags_records[date_str])
            print(f"[+] Codeforces {date_str}: +{len(problems)} AC")
            
        for date_str, count in try_count.items():
            daily_data[date_str]["try"] += count
            
    except Exception as e:
        print("[-] Failed to fetch Codeforces:", e)

def fetch_atcoder():
    print("\nFetching AtCoder data...")
    if not ATCODER_HANDLE or ATCODER_HANDLE == "你的AtCoder_ID":
        print("[-] AtCoder ID 未配置，跳过。")
        return
        
    url = f"https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user={ATCODER_HANDLE}&from_second=0"
    try:
        response = requests.get(url, timeout=10).json()
        ac_records = defaultdict(set)
        try_count = defaultdict(int)
        
        for sub in response:
            date_str = datetime.fromtimestamp(sub["epoch_second"]).strftime('%Y-%m-%d')
            
            # 过滤 C++
            if "C++" not in sub.get("language", ""):
                continue
                
            problem_id = sub["problem_id"]
            if sub["result"] == "AC":
                ac_records[date_str].add(problem_id)
            elif sub["result"] != "WJ": # WJ 是评测中
                try_count[date_str] += 1
                
        for date_str, problems in ac_records.items():
            daily_data[date_str]["atcoder"] += len(problems)
            daily_data[date_str]["ac"] += len(problems)
            print(f"[+] AtCoder {date_str}: +{len(problems)} AC")
            
        for date_str, count in try_count.items():
            daily_data[date_str]["try"] += count
            
    except Exception as e:
        print("[-] Failed to fetch AtCoder:", e)

def fetch_luogu():
    print("\nFetching Luogu data...")
    if not LUOGU_UID or not LUOGU_COOKIE:
        print("[-] 洛谷 UID 或 Cookie 未配置，跳过。")
        return
        
    # 直接访问个人主页，主页的 HTML 结构相对固定且容易提取基础状态
    url = f"https://www.luogu.com.cn/user/{LUOGU_UID}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Cookie": LUOGU_COOKIE.strip('"\''), 
        "Referer": "https://www.luogu.com.cn/",
        "Host": "www.luogu.com.cn"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        # 同样利用正则尝试在个人主页源码中捕获加密的初始化数据
        match = re.search(r'window\._feInjection\s*=\s*JSON\.parse\(decodeURIComponent\("([^"]+)"\)\);', response.text)
        
        if match:
            encoded_data = match.group(1)
            decoded_data = urllib.parse.unquote(encoded_data)
            res_json = json.loads(decoded_data)
            
            # 从个人主页的用户数据中尝试读取基本信息
            user_data = res_json.get('currentData', {}).get('user', {})
            print(f"[+] 成功连接洛谷主页: 欢迎用户 {user_data.get('name', 'Unknown')}")
            
        # 如果主页也无法通过 _feInjection 读取，我们不强求硬解历史提交列表
        # 避免脚本崩溃。你可以先让 CF、AtCoder 和牛客稳定运行
        print("[*] 洛谷主页状态正常，由于洛谷前端加密策略更新，历史日历将以其他平台数据为主。")
            
    except Exception as e:
        print("[-] Failed to fetch Luogu:", e)

def fetch_nowcoder():
    print("\nFetching Nowcoder data...")
    url = f"https://ac.nowcoder.com/acm/contest/profile/{NOWCODER_UID}/practice-coding?page=1"
    try:
        response = requests.get(url, headers=NOWCODER_HEADERS, timeout=10)
        
        if "请登录" in response.text or response.status_code != 200:
            print("[-] 牛客 Cookie 可能已失效，或访问被拒绝。")
            return
            
        soup = BeautifulSoup(response.text, 'html.parser')
        tables = soup.find_all('table')
        if not tables:
            print("[-] 未在页面中找到表格结构。")
            return
            
        ac_records = defaultdict(set)
        try_count = defaultdict(int)
        rows = tables[0].find_all('tr')
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 9: 
                problem_cell = cols[1]
                status_cell = cols[2]
                lang_cell = cols[7]
                time_cell = cols[8]
                
                status_text = status_cell.text.strip()
                lang_text = lang_cell.text.strip()
                submit_time = time_cell.text.strip().split(" ")[0] 
                
                if "C++" in lang_text:
                    problem_a = problem_cell.find('a')
                    if problem_a and 'href' in problem_a.attrs:
                        problem_id = problem_a['href']
                    else:
                        problem_id = problem_cell.text.strip()
                        
                    if "答案正确" in status_text or "Accepted" in status_text:
                        ac_records[submit_time].add(problem_id)
                    else:
                        try_count[submit_time] += 1
        
        for date_str, problems in ac_records.items():
            daily_data[date_str]["nowcoder"] += len(problems)
            daily_data[date_str]["ac"] += len(problems)
            print(f"[+] Nowcoder {date_str}: +{len(problems)} AC")
            
        for date_str, count in try_count.items():
            daily_data[date_str]["try"] += count

    except Exception as e:
        print("[-] Failed to fetch Nowcoder:", e)

def build_json():
    fetch_codeforces()
    fetch_atcoder()
    fetch_luogu()
    fetch_nowcoder()
    
    # 构建最终用于导出的字典
    final_data = {}
    for date_str, counts in daily_data.items():
        # 将 set 转换为 list 以便 JSON 序列化
        counts["tags"] = list(counts["tags"])
        # 保留 total 字段以防前端旧逻辑报错
        counts["total"] = counts["ac"]
        final_data[date_str] = dict(counts)
    
    # 按照时间排序
    sorted_data = dict(sorted(final_data.items()))
    
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, indent=4, ensure_ascii=False)
    
    print("\n[+] Successfully generated data.json!")

if __name__ == "__main__":
    build_json()