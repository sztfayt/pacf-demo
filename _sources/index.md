# PACF交互式演示

<div id="pyodide-loading">
    正在加载Pyodide和必要的Python包，请稍候...
</div>

<div id="controls-container">
</div>

<div id="plots-container">
</div>

<div id="results-container">
    <h3>计算结果对比</h3>
    <table id="results-table">
        <thead>
            <tr>
                <th>滞后阶数</th>
                <th>ACF</th>
                <th>PACF</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
</div>

## 项目说明

这是一个交互式的偏自相关函数(PACF)演示项目。通过调整AR(3)模型的参数，您可以直观地观察到自相关函数(ACF)和偏自相关函数(PACF)的变化。

### 功能特点

1. 可调节AR(3)模型的三个参数：φ₁、φ₂、φ₃
2. 可设置时间序列的长度
3. 实时显示ACF和PACF的散点图
4. 提供计算结果的对比表格

### 使用说明

1. 使用滑块调整AR(3)模型的参数
2. 设置时间序列的长度
3. 点击"更新图表"按钮查看结果
4. 观察ACF和PACF的变化

### 技术实现

本项目使用以下技术：

- Pyodide：在浏览器中运行Python代码
- NumPy：进行数值计算
- Matplotlib：绘制图表
- Scikit-learn：进行线性回归计算

### 本地运行

1. 克隆项目仓库
2. 安装依赖：`pip install -r requirements.txt`
3. 运行Jupyter Book：`jupyter-book build .`
4. 在浏览器中打开`_build/html/index.html`

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