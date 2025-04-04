# PACF交互式演示

```{raw} html
<div class="container">
    <div id="pyodide-loading">
        正在加载Python环境，请稍候...
    </div>
    
    <div id="controls-container" class="controls">
        <h3>AR(3)模型参数设置</h3>
    </div>
    
    <div id="plots-container" class="plots">
        <h3>结果展示</h3>
    </div>
    
    <div id="comparison-container" class="comparison">
        <h3>计算结果比较</h3>
    </div>
</div>
```

## 项目说明

这个项目提供了一个交互式网页，用于展示AR(3)模型中偏自相关系数(PACF)的计算过程，并与自相关系数(ACF)进行对比。

## 功能特点

- 用户可以自行输入AR(3)模型的系数
- 展示滞后1、2、3阶的偏自相关系数计算过程
- 通过散点图直观展示PACF与ACF的区别
- 将手动计算的PACF与Python自带的statsmodels计算结果进行对比
- 完全在浏览器中运行，无需服务器支持

## 使用说明

1. 使用滑块调整AR(3)模型的参数：
   - φ₁：第一阶系数
   - φ₂：第二阶系数
   - φ₃：第三阶系数
   - n：序列长度

2. 点击"更新图表"按钮查看结果：
   - 左侧图表显示自相关系数(ACF)
   - 右侧图表显示偏自相关系数(PACF)
   - 下方表格比较手动计算结果和statsmodels计算结果

## 技术实现

本项目使用以下技术：

- [Jupyter Book](https://jupyterbook.org)：将Jupyter Notebook转换为静态网页
- [Pyodide](https://pyodide.org)：在浏览器中运行Python代码
- [ipywidgets](https://ipywidgets.readthedocs.io)：创建交互式控件
- [Matplotlib](https://matplotlib.org)：绘制图表
- [NumPy](https://numpy.org)和[Pandas](https://pandas.pydata.org)：数据处理

## 本地运行

1. 安装Jupyter Book:
```bash
pip install jupyter-book
```

2. 克隆本仓库:
```bash
git clone https://github.com/sztfayt/pacf-demo.git
cd pacf-demo
```

3. 构建静态网站:
```bash
jupyter-book build .
``` 