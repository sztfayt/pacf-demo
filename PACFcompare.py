# %%
import numpy as np
import pandas as pd

# 生成AR(2)序列
np.random.seed(42)
n = 200
epsilon = np.random.normal(0, 1, n)
X = np.zeros(n)
for t in range(1, n):
    X[t] = X[t - 1] - 0.5 * X[t - 2] + epsilon[t]

# 创建滞后项 DataFrame
df = pd.DataFrame({
    'X_t': X[2:],  # 当前值
    'X_{t-1}': X[1:-1],  # 滞后1期
    'X_{t-2}': X[:-2]  # 滞后2期
})

# %%
import seaborn as sns
import matplotlib.pyplot as plt
# 计算残差间的相关系数（即PACF(2)）
acf2 = df['X_t'].corr(df['X_{t-2}'])
print(f"ACF(2)是: {acf2:.3f}")

# 绘制散点图矩阵（含直方图）
sns.pairplot(df, diag_kind='kde', plot_kws={'alpha': 0.5})
plt.suptitle("Scatter Matrix of X_t, X_{t-1}, X_{t-2} (Raw Data)", y=1.02)
plt.show()

# %%
from sklearn.linear_model import LinearRegression

# 步骤1：X_t 对 X_{t-1} 回归，获取残差
model1 = LinearRegression()
model1.fit(df[['X_{t-1}']], df['X_t'])
resid_Xt = df['X_t'] - model1.predict(df[['X_{t-1}']])

# 步骤2：X_{t-2} 对 X_{t-1} 回归，获取残差
model2 = LinearRegression()
model2.fit(df[['X_{t-1}']], df['X_{t-2}'])
resid_Xt2 = df['X_{t-2}'] - model2.predict(df[['X_{t-1}']])

# 合并残差数据
df_resid = pd.DataFrame({'resid_Xt': resid_Xt, 'resid_Xt2': resid_Xt2})

# %%
# 计算残差间的相关系数（即PACF(2)）
pacf2 = df_resid.corr().iloc[0, 1]

# 绘制残差散点图
plt.figure(figsize=(6, 6))
sns.scatterplot(data=df_resid, x='resid_Xt2', y='resid_Xt', alpha=0.6)
plt.title(f"Partial Correlation (PACF(2)): {pacf2:.3f}")
plt.xlabel("Residual of X_{t-2} | X_{t-1}")
plt.ylabel("Residual of X_t | X_{t-1}")
plt.grid(True)

# 添加趋势线（若PACF显著）
if abs(pacf2) > 0.1:
    sns.regplot(data=df_resid,
                x='resid_Xt2',
                y='resid_Xt',
                scatter=False,
                color='red')

plt.show()

# %%
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# 原始 X_t 与 X_{t-2} 的散点图
sns.scatterplot(data=df, x='X_{t-2}', y='X_t', ax=axes[0], alpha=0.5)
axes[0].set_title("Raw Correlation (ACF(2)): 0.07")
sns.regplot(data=df,
            x='X_{t-2}',
            y='X_t',
            ax=axes[0],
            scatter=False,
            color='red')

# 残差散点图
sns.scatterplot(data=df_resid,
                x='resid_Xt2',
                y='resid_Xt',
                ax=axes[1],
                alpha=0.5)
axes[1].set_title(f"Partial Correlation (PACF(2)): {pacf2:.3f}")
sns.regplot(data=df_resid,
            x='resid_Xt2',
            y='resid_Xt',
            scatter=False,
            color='red')

plt.tight_layout()
plt.show()
