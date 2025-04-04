# 导入必要的库
import dash
from dash import dcc, html, Output, Input  # 显式导入Output和Input
import numpy as np  # 显式导入numpy
import statsmodels.api as sm  # 显式导入statsmodels
import plotly.graph_objects as go

# 初始化Dash应用
app = dash.Dash(__name__)

# 布局设计
app.layout = html.Div([
    dcc.Slider(id='phi1-slider', min=-1, max=1, step=0.1, value=0.5),
    dcc.Graph(id='time-series-plot'),
    dcc.Graph(id='pacf-plot')
])


# 定义生成AR(1)时间序列的函数
def generate_ar1_series(phi1, n=100):
    np.random.seed(0)
    epsilon = np.random.normal(size=n)
    X = [epsilon[0]]
    for t in range(1, n):
        X.append(phi1 * X[t - 1] + epsilon[t])
    return X


# 定义计算PACF的函数
def calculate_pacf(series, nlags=5):
    return sm.tsa.stattools.pacf(series, nlags=nlags)


# 回调函数更新图形
@app.callback(
    [
        Output('time-series-plot', 'figure'),  # 使用Output
        Output('pacf-plot', 'figure')
    ],
    [Input('phi1-slider', 'value')]  # 使用Input
)
def update_plots(phi1):
    # 生成AR(1)时间序列
    X = generate_ar1_series(phi1)

    # 计算PACF
    pacf = calculate_pacf(X)

    # 绘制图形
    ts_fig = go.Figure(data=go.Scatter(y=X, mode='lines'))
    pacf_fig = go.Figure(data=go.Bar(y=pacf))
    return ts_fig, pacf_fig


# 运行应用
if __name__ == '__main__':
    app.run(debug=True)