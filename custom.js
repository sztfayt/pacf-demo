// 初始化Pyodide
let pyodide;

async function initPyodide() {
    try {
        pyodide = await loadPyodide();
        console.log("Pyodide loaded successfully");

        // 加载必要的包
        await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "scikit-learn"]);
        console.log("Packages loaded successfully");

        // 加载自定义Python代码
        await pyodide.runPythonAsync(`
      import numpy as np
      import pandas as pd
      import matplotlib.pyplot as plt
      from sklearn.linear_model import LinearRegression
      
      # 定义AR(3)模型生成函数
      def generate_ar3_series(phi1, phi2, phi3, n=200):
          """
          生成AR(3)时间序列
          
          参数:
          phi1, phi2, phi3: AR(3)模型的系数
          n: 序列长度
          
          返回:
          X: 生成的时间序列
          """
          np.random.seed(42)
          epsilon = np.random.normal(0, 1, n)
          X = np.zeros(n)
          
          # 初始化前三个值
          X[0] = epsilon[0]
          X[1] = phi1 * X[0] + epsilon[1]
          X[2] = phi1 * X[1] + phi2 * X[0] + epsilon[2]
          
          # 生成剩余的值
          for t in range(3, n):
              X[t] = phi1 * X[t-1] + phi2 * X[t-2] + phi3 * X[t-3] + epsilon[t]
          
          return X
      
      # 定义计算PACF的函数
      def calculate_pacf_manual(X, lag):
          """
          手动计算PACF(lag)
          
          参数:
          X: 时间序列
          lag: 滞后阶数
          
          返回:
          pacf: PACF值
          resid_Xt: X_t的残差
          resid_Xlag: X_{t-lag}的残差
          """
          n = len(X)
          
          # 创建滞后项DataFrame
          df = pd.DataFrame()
          df['X_t'] = X[lag:]
          
          # 添加所有滞后项
          for i in range(1, lag+1):
              df[f'X_{{t-{i}}}'] = X[lag-i:-i]
          
          # 步骤1：X_t 对所有中间滞后项回归，获取残差
          X_intermediate = df[[f'X_{{t-{i}}}' for i in range(1, lag)]]
          model1 = LinearRegression()
          model1.fit(X_intermediate, df['X_t'])
          resid_Xt = df['X_t'] - model1.predict(X_intermediate)
          
          # 步骤2：X_{t-lag} 对所有中间滞后项回归，获取残差
          model2 = LinearRegression()
          model2.fit(X_intermediate, df[f'X_{{t-{lag}}}'])
          resid_Xlag = df[f'X_{{t-{lag}}}'] - model2.predict(X_intermediate)
          
          # 计算残差间的相关系数（即PACF(lag)）
          pacf = np.corrcoef(resid_Xt, resid_Xlag)[0, 1]
          
          return pacf, resid_Xt, resid_Xlag
      
      # 定义计算ACF的函数
      def calculate_acf(X, lag):
          """
          计算自相关系数ACF(lag)
          
          参数:
          X: 时间序列
          lag: 滞后阶数
          
          返回:
          acf: ACF值
          """
          n = len(X)
          X_centered = X - np.mean(X)
          
          # 计算自协方差
          gamma_0 = np.sum(X_centered**2) / n
          gamma_lag = np.sum(X_centered[lag:] * X_centered[:-lag]) / n
          
          # 计算自相关系数
          acf = gamma_lag / gamma_0
          
          return acf
      
      # 定义更新图表的函数
      def update_plots(phi1, phi2, phi3, n):
          """
          更新图表
          
          参数:
          phi1, phi2, phi3: AR(3)模型的系数
          n: 序列长度
          
          返回:
          result: 包含图表数据和比较表格的字典
          """
          # 生成AR(3)序列
          X = generate_ar3_series(phi1, phi2, phi3, n)
          
          # 计算PACF和ACF
          pacf1, resid_Xt1, resid_Xlag1 = calculate_pacf_manual(X, 1)
          pacf2, resid_Xt2, resid_Xlag2 = calculate_pacf_manual(X, 2)
          pacf3, resid_Xt3, resid_Xlag3 = calculate_pacf_manual(X, 3)
          
          acf1 = calculate_acf(X, 1)
          acf2 = calculate_acf(X, 2)
          acf3 = calculate_acf(X, 3)
          
          # 尝试使用statsmodels计算PACF
          try:
              import statsmodels.api as sm
              pacf_statsmodels = sm.tsa.stattools.pacf(X, nlags=3)
              pacf_statsmodels = pacf_statsmodels[1:]  # 去掉lag=0的值
          except ImportError:
              pacf_statsmodels = [None, None, None]
              print("无法导入statsmodels，无法计算官方PACF值")
          
          # 创建比较表格
          comparison = pd.DataFrame({
              '滞后阶数': [1, 2, 3],
              '真实系数': [phi1, phi2, phi3],
              '自相关系数(ACF)': [acf1, acf2, acf3],
              '偏自相关系数(PACF)': [pacf1, pacf2, pacf3],
              'statsmodels PACF': pacf_statsmodels
          })
          
          # 返回结果
          return {
              'X': X,
              'acf': [acf1, acf2, acf3],
              'pacf': [pacf1, pacf2, pacf3],
              'resid_Xt': [resid_Xt1, resid_Xt2, resid_Xt3],
              'resid_Xlag': [resid_Xlag1, resid_Xlag2, resid_Xlag3],
              'comparison': comparison.to_dict('records')
          }
    `);

        console.log("Python functions loaded successfully");

        // 隐藏加载指示器
        document.getElementById('pyodide-loading').style.display = 'none';

        // 初始化控件
        initControls();

        // 初始更新图表
        updatePlots();

    } catch (error) {
        console.error("Error initializing Pyodide:", error);
        document.getElementById('pyodide-loading').innerHTML = `
      <div class="alert alert-danger">
        <h4>加载失败</h4>
        <p>初始化Pyodide时出错: ${error.message}</p>
        <p>请刷新页面重试。</p>
      </div>
    `;
    }
}

// 创建自定义滑块控件
function createSlider(id, min, max, step, value, label) {
    const container = document.createElement('div');
    container.className = 'slider-container';

    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    const valueDisplay = document.createElement('span');
    valueDisplay.id = `${id}-value`;
    valueDisplay.textContent = value;

    slider.addEventListener('input', function () {
        valueDisplay.textContent = this.value;
    });

    container.appendChild(labelElement);
    container.appendChild(slider);
    container.appendChild(valueDisplay);

    return container;
}

// 创建更新按钮
function createButton(id, text) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    button.className = 'update-button';

    return button;
}

// 创建图表容器
function createPlotContainer(id) {
    const container = document.createElement('div');
    container.id = id;
    container.className = 'plot-container';

    return container;
}

// 初始化页面控件
function initControls() {
    const controlsContainer = document.getElementById('controls-container');

    // 添加滑块
    controlsContainer.appendChild(createSlider('phi1-slider', -1, 1, 0.1, 0.5, 'φ₁:'));
    controlsContainer.appendChild(createSlider('phi2-slider', -1, 1, 0.1, -0.3, 'φ₂:'));
    controlsContainer.appendChild(createSlider('phi3-slider', -1, 1, 0.1, 0.2, 'φ₃:'));
    controlsContainer.appendChild(createSlider('n-slider', 100, 1000, 100, 200, '序列长度:'));

    // 添加更新按钮
    controlsContainer.appendChild(createButton('update-button', '更新图表'));

    // 添加图表容器
    document.getElementById('plots-container').appendChild(createPlotContainer('plots'));

    // 添加比较表格容器
    document.getElementById('comparison-container').appendChild(createPlotContainer('comparison-table'));

    // 绑定更新按钮事件
    document.getElementById('update-button').addEventListener('click', updatePlots);
}

// 更新图表
async function updatePlots() {
    if (!pyodide) {
        console.error("Pyodide not initialized");
        return;
    }

    const phi1 = parseFloat(document.getElementById('phi1-slider').value);
    const phi2 = parseFloat(document.getElementById('phi2-slider').value);
    const phi3 = parseFloat(document.getElementById('phi3-slider').value);
    const n = parseInt(document.getElementById('n-slider').value);

    try {
        // 调用Python函数生成数据和计算PACF
        const result = await pyodide.runPythonAsync(`
      update_plots(${phi1}, ${phi2}, ${phi3}, ${n})
    `);

        // 更新图表和表格
        updatePlotsDisplay(result);
        updateComparisonTable(result);
    } catch (error) {
        console.error("Error updating plots:", error);
        document.getElementById('plots').innerHTML = `
      <div class="alert alert-danger">
        <h4>更新失败</h4>
        <p>更新图表时出错: ${error.message}</p>
      </div>
    `;
    }
}

// 更新图表显示
function updatePlotsDisplay(result) {
    const plotsContainer = document.getElementById('plots');
    plotsContainer.innerHTML = '';

    // 创建图表
    const fig = document.createElement('figure');
    fig.className = 'figure';

    // 创建3x2的子图
    for (let i = 0; i < 3; i++) {
        const row = document.createElement('div');
        row.className = 'row';

        // ACF图
        const acfCol = document.createElement('div');
        acfCol.className = 'col-md-6';
        const acfCanvas = document.createElement('canvas');
        acfCanvas.id = `acf-${i + 1}`;
        acfCol.appendChild(acfCanvas);
        row.appendChild(acfCol);

        // PACF图
        const pacfCol = document.createElement('div');
        pacfCol.className = 'col-md-6';
        const pacfCanvas = document.createElement('canvas');
        pacfCanvas.id = `pacf-${i + 1}`;
        pacfCol.appendChild(pacfCanvas);
        row.appendChild(pacfCol);

        fig.appendChild(row);
    }

    plotsContainer.appendChild(fig);

    // 使用Matplotlib绘制图表
    pyodide.runPythonAsync(`
    import matplotlib.pyplot as plt
    import numpy as np
    
    # 设置中文字体
    plt.rcParams['font.sans-serif'] = ['SimHei']
    plt.rcParams['axes.unicode_minus'] = False
    
    # 创建图表
    fig, axes = plt.subplots(3, 2, figsize=(12, 18))
    
    # 第一行：lag=1
    # ACF(1)
    axes[0, 0].scatter(${result.X.slice(0, -1)}, ${result.X.slice(1)}, alpha=0.5)
    axes[0, 0].set_title(f"自相关系数 ACF(1): {${result.acf[0]}:.3f}")
    axes[0, 0].set_xlabel("X_{t-1}")
    axes[0, 0].set_ylabel("X_t")
    if abs(${result.acf[0]}) > 0.1:
        z = np.polyfit(${result.X.slice(0, -1)}, ${result.X.slice(1)}, 1)
        p = np.poly1d(z)
        axes[0, 0].plot(${result.X.slice(0, -1)}, p(${result.X.slice(0, -1)}), "r--", alpha=0.8)
    
    # PACF(1)
    axes[0, 1].scatter(${result.resid_Xlag[0]}, ${result.resid_Xt[0]}, alpha=0.5)
    axes[0, 1].set_title(f"偏自相关系数 PACF(1): {${result.pacf[0]}:.3f}")
    axes[0, 1].set_xlabel("残差 X_{t-1}")
    axes[0, 1].set_ylabel("残差 X_t")
    if abs(${result.pacf[0]}) > 0.1:
        z = np.polyfit(${result.resid_Xlag[0]}, ${result.resid_Xt[0]}, 1)
        p = np.poly1d(z)
        axes[0, 1].plot(${result.resid_Xlag[0]}, p(${result.resid_Xlag[0]}), "r--", alpha=0.8)
    
    # 第二行：lag=2
    # ACF(2)
    axes[1, 0].scatter(${result.X.slice(0, -2)}, ${result.X.slice(2)}, alpha=0.5)
    axes[1, 0].set_title(f"自相关系数 ACF(2): {${result.acf[1]}:.3f}")
    axes[1, 0].set_xlabel("X_{t-2}")
    axes[1, 0].set_ylabel("X_t")
    if abs(${result.acf[1]}) > 0.1:
        z = np.polyfit(${result.X.slice(0, -2)}, ${result.X.slice(2)}, 1)
        p = np.poly1d(z)
        axes[1, 0].plot(${result.X.slice(0, -2)}, p(${result.X.slice(0, -2)}), "r--", alpha=0.8)
    
    # PACF(2)
    axes[1, 1].scatter(${result.resid_Xlag[1]}, ${result.resid_Xt[1]}, alpha=0.5)
    axes[1, 1].set_title(f"偏自相关系数 PACF(2): {${result.pacf[1]}:.3f}")
    axes[1, 1].set_xlabel("残差 X_{t-2}")
    axes[1, 1].set_ylabel("残差 X_t")
    if abs(${result.pacf[1]}) > 0.1:
        z = np.polyfit(${result.resid_Xlag[1]}, ${result.resid_Xt[1]}, 1)
        p = np.poly1d(z)
        axes[1, 1].plot(${result.resid_Xlag[1]}, p(${result.resid_Xlag[1]}), "r--", alpha=0.8)
    
    # 第三行：lag=3
    # ACF(3)
    axes[2, 0].scatter(${result.X.slice(0, -3)}, ${result.X.slice(3)}, alpha=0.5)
    axes[2, 0].set_title(f"自相关系数 ACF(3): {${result.acf[2]}:.3f}")
    axes[2, 0].set_xlabel("X_{t-3}")
    axes[2, 0].set_ylabel("X_t")
    if abs(${result.acf[2]}) > 0.1:
        z = np.polyfit(${result.X.slice(0, -3)}, ${result.X.slice(3)}, 1)
        p = np.poly1d(z)
        axes[2, 0].plot(${result.X.slice(0, -3)}, p(${result.X.slice(0, -3)}), "r--", alpha=0.8)
    
    # PACF(3)
    axes[2, 1].scatter(${result.resid_Xlag[2]}, ${result.resid_Xt[2]}, alpha=0.5)
    axes[2, 1].set_title(f"偏自相关系数 PACF(3): {${result.pacf[2]}:.3f}")
    axes[2, 1].set_xlabel("残差 X_{t-3}")
    axes[2, 1].set_ylabel("残差 X_t")
    if abs(${result.pacf[2]}) > 0.1:
        z = np.polyfit(${result.resid_Xlag[2]}, ${result.resid_Xt[2]}, 1)
        p = np.poly1d(z)
        axes[2, 1].plot(${result.resid_Xlag[2]}, p(${result.resid_Xlag[2]}), "r--", alpha=0.8)
    
    plt.tight_layout()
    
    # 将图表转换为HTML
    from io import BytesIO
    import base64
    
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100)
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    
    img_str
  `).then(imgStr => {
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${imgStr}`;
        img.className = 'img-fluid';
        plotsContainer.innerHTML = '';
        plotsContainer.appendChild(img);
    });
}

// 更新比较表格
function updateComparisonTable(result) {
    const tableContainer = document.getElementById('comparison-table');
    tableContainer.innerHTML = '';

    // 创建表格
    const table = document.createElement('table');
    table.className = 'table table-striped';

    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = ['滞后阶数', '真实系数', '自相关系数(ACF)', '偏自相关系数(PACF)', 'statsmodels PACF'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 创建表体
    const tbody = document.createElement('tbody');

    result.comparison.forEach(row => {
        const tr = document.createElement('tr');

        // 滞后阶数
        const td1 = document.createElement('td');
        td1.textContent = row['滞后阶数'];
        tr.appendChild(td1);

        // 真实系数
        const td2 = document.createElement('td');
        td2.textContent = row['真实系数'].toFixed(3);
        tr.appendChild(td2);

        // 自相关系数(ACF)
        const td3 = document.createElement('td');
        td3.textContent = row['自相关系数(ACF)'].toFixed(3);
        tr.appendChild(td3);

        // 偏自相关系数(PACF)
        const td4 = document.createElement('td');
        td4.textContent = row['偏自相关系数(PACF)'].toFixed(3);
        tr.appendChild(td4);

        // statsmodels PACF
        const td5 = document.createElement('td');
        td5.textContent = row['statsmodels PACF'] !== null ? row['statsmodels PACF'].toFixed(3) : 'N/A';
        tr.appendChild(td5);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // 添加解释文本
    const explanation = document.createElement('div');
    explanation.className = 'explanation';
    explanation.innerHTML = `
    <h3>解释：</h3>
    <p>1. 左列显示的是自相关系数(ACF)，右列显示的是偏自相关系数(PACF)。</p>
    <p>2. 在AR(3)模型中，理论上PACF(1)、PACF(2)和PACF(3)应该分别接近φ₁(${document.getElementById('phi1-slider').value})、φ₂(${document.getElementById('phi2-slider').value})和φ₃(${document.getElementById('phi3-slider').value})。</p>
    <p>3. 而ACF则会呈现逐渐衰减的趋势，不会在滞后3阶后突然截断。</p>
    <p>4. 这就是为什么PACF在识别AR模型的阶数时特别有用。</p>
  `;

    tableContainer.appendChild(explanation);
}

// 页面加载完成后初始化Pyodide
window.addEventListener('load', initPyodide); 