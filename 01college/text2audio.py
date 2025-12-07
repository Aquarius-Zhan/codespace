import asyncio
import edge_tts
import sys

# 从命令行获取输入文本（第1个参数）
text = sys.argv[1] if len(sys.argv) > 1 else "默认文本"
voice = "zh-CN-XiaoxiaoNeural"  # 微软中文女声
output_file = "output.mp3"       # 输出文件名

async def tts():
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)
    print(f"✅ 音频已生成：{output_file}")  # 打印成功信息

asyncio.run(tts())