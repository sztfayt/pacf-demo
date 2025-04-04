# PACF交互式演示

这个项目提供了一个交互式网页，用于展示AR(3)模型中偏自相关系数(PACF)的计算过程，并与自相关系数(ACF)进行对比。

## 功能特点

- 用户可以自行输入AR(3)模型的系数
- 展示滞后1、2、3阶的偏自相关系数计算过程
- 通过散点图直观展示PACF与ACF的区别
- 将手动计算的PACF与Python自带的statsmodels计算结果进行对比
- 完全在浏览器中运行，无需服务器支持

## 技术实现

本项目使用以下技术：

- [Jupyter Book](https://jupyterbook.org/)：将Jupyter Notebook转换为静态网页
- [Pyodide](https://pyodide.org/)：在浏览器中运行Python代码
- [ipywidgets](https://ipywidgets.readthedocs.io/)：创建交互式控件
- [Matplotlib](https://matplotlib.org/)：绘制图表
- [NumPy](https://numpy.org/)和[Pandas](https://pandas.pydata.org/)：数据处理

## 本地运行

1. 安装Jupyter Book：

```bash
pip install jupyter-book
```

2. 克隆本仓库：

```bash
git clone https://github.com/yourusername/pacf-demo.git
cd pacf-demo
```

3. 构建静态网站：

```bash
jupyter-book build .
```

4. 在浏览器中打开生成的网站：

```bash
# 在Windows上
start _build/html/index.html

# 在macOS上
open _build/html/index.html

# 在Linux上
xdg-open _build/html/index.html
```

## 部署到GitHub Pages

1. 安装ghp-import：

```bash
pip install ghp-import
```

2. 将构建的网站部署到GitHub Pages：

```bash
ghp-import -n -p -f _build/html
```

3. 在GitHub仓库设置中启用GitHub Pages，选择gh-pages分支作为源。

## 项目结构

```
pacf-demo/
├── _config.yml              # Jupyter Book配置文件
├── _templates/              # 自定义HTML模板
│   └── page.html            # 页面模板
├── custom.js                # 自定义JavaScript
├── custom.css               # 自定义CSS
├── notebooks/               # Jupyter Notebooks
│   └── pacf_interactive.ipynb  # 交互式演示Notebook
└── README.md                # 项目说明
```

## 使用方法

1. 打开网页后，使用滑块调整AR(3)模型的系数(φ₁, φ₂, φ₃)和序列长度
2. 点击"更新图表"按钮生成新的时间序列和相关系数
3. 观察散点图中PACF与ACF的区别
4. 查看比较表格，了解手动计算的PACF与statsmodels计算结果的差异

## 教学应用

这个交互式演示可以帮助学生理解：

- AR模型的基本原理
- 自相关系数(ACF)与偏自相关系数(PACF)的区别
- PACF在AR模型阶数识别中的应用
- 手动计算PACF的方法

## 贡献

欢迎提交问题和改进建议！

## 许可证

MIT 