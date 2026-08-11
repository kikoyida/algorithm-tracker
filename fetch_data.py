import requests
import json
from datetime import datetime
from collections import defaultdict
import os
from bs4 import BeautifulSoup  # 新增：用于解析牛客网页

# ================= 配置区 =================
CF_HANDLE = "kikoyida1016"
NOWCODER_UID = "278539296"  # 你的牛客 UID 已经填好

# 你的真实牛客 Cookie
NOWCODER_COOKIE = os.getenv("nowcoder_cookie","")

NOWCODER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Cookie": NOWCODER_COOKIE
}
# ==========================================

daily_data = defaultdict(lambda: {"codeforces": 0, "luogu": 0, "nowcoder": 0, "total": 0})

def fetch_codeforces():
    print("Fetching Codeforces data...")
    url = f"https://codeforces.com/api/user.status?handle={CF_HANDLE}"
    try:
        response = requests.get(url, timeout=10).json()
        if response["status"] != "OK":
            print(f"[-] Codeforces error: {response.get('comment')}")
            return
        
        ac_records = defaultdict(set)
        
        for sub in response["result"]:
            if sub.get("verdict") == "OK":
                date_str = datetime.fromtimestamp(sub["creationTimeSeconds"]).strftime('%Y-%m-%d')
                problem_id = f"{sub['problem'].get('contestId', '')}{sub['problem'].get('index', '')}"
                
                # 过滤出 C++ 的提交
                if "C++" not in sub.get("programmingLanguage", ""):
                    continue
                    
                ac_records[date_str].add(problem_id)
        
        for date_str, problems in ac_records.items():
            daily_data[date_str]["codeforces"] += len(problems)
            print(f"[+] Codeforces {date_str}: +{len(problems)} AC")
            
    except Exception as e:
        print("[-] Failed to fetch Codeforces:", e)

def fetch_nowcoder():
    print("\nFetching Nowcoder data...")
    # 这里我们先抓取第一页的数据
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
        rows = tables[0].find_all('tr')
        
        for row in rows:
            cols = row.find_all('td')
            
            # 根据最新 Debug 结果：有效行至少有 9 列
            if len(cols) >= 9: 
                problem_cell = cols[1]  # 题目名称在第 2 列
                status_cell = cols[2]   # 状态在第 3 列
                lang_cell = cols[7]     # 语言在第 8 列
                time_cell = cols[8]     # 提交时间在第 9 列
                
                status_text = status_cell.text.strip()
                lang_text = lang_cell.text.strip()
                # 提取日期 "2026-06-07 19:24:25" -> "2026-06-07"
                submit_time = time_cell.text.strip().split(" ")[0] 
                
                # 判断是否 AC，且使用的是 C++
                if ("答案正确" in status_text or "Accepted" in status_text) and "C++" in lang_text:
                    
                    problem_a = problem_cell.find('a')
                    # 优先取链接去重，没有链接就用纯文本题目名去重
                    if problem_a and 'href' in problem_a.attrs:
                        problem_id = problem_a['href']
                    else:
                        problem_id = problem_cell.text.strip()
                        
                    ac_records[submit_time].add(problem_id)
        
        for date_str, problems in ac_records.items():
            daily_data[date_str]["nowcoder"] += len(problems)
            print(f"[+] Nowcoder {date_str}: +{len(problems)} AC")

    except Exception as e:
        print("[-] Failed to fetch Nowcoder:", e)

def build_json():
    fetch_codeforces()
    fetch_nowcoder()
    
    # 计算每一天的 total 总数
    for date_str in daily_data:
        counts = daily_data[date_str]
        counts["total"] = counts["codeforces"] + counts["luogu"] + counts["nowcoder"]
    
    # 按照时间排序
    sorted_data = dict(sorted(daily_data.items()))
    
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, indent=4, ensure_ascii=False)
    
    print("\n[+] Successfully generated data.json!")

if __name__ == "__main__":
    build_json()