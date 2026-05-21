import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import re

# Загрузка данных
print("Загрузка данных...")
df = pd.read_csv('/workspace/msk_unisender.com.csv', sep=';', encoding='utf-8')

print(f"Исходное количество строк: {len(df)}")
print(f"Колонки: {list(df.columns)}")

# Очистка данных
print("\nОчистка данных...")

# Удаление дубликатов по ключевому слову
df = df.drop_duplicates(subset=['Ключевое слово'], keep='first')

# Удаление строк с пустыми ключевыми словами
df = df[df['Ключевое слово'].notna()]
df = df[df['Ключевое слово'].str.strip() != '']

# Преобразование частотности в числовой формат
df['Частотность Весь мир'] = pd.to_numeric(df['Частотность Весь мир'], errors='coerce').fillna(0)

# Удаление лишних кавычек из ключевого слова
df['Ключевое слово'] = df['Ключевое слово'].str.replace('"', '').str.strip()

print(f"Количество строк после очистки: {len(df)}")

# Функция для классификации запросов
def classify_query(keyword):
    keyword_lower = str(keyword).lower()
    
    # Коммерческие маркеры
    commercial_markers = [
        'купить', 'цена', 'стоимость', 'заказать', 'заказ', 'магазин', 'интернет-магазин',
        'продажа', 'скидка', 'акция', 'распродажа', 'дешево', 'недорого', 'выгодно',
        'тариф', 'оплата', 'оплатить', 'платно', 'подписка', 'сервис', 'услуга',
        'корпоративный', 'бизнес', 'для бизнеса', 'api', 'интеграция', 'рассылка',
        'email рассылка', 'sms рассылка', 'push уведомления', 'чат-бот', 'автоматизация',
        'crm', 'регистрация', 'войти', 'логин', 'кабинет', 'демо', 'пробный период',
        'вебинар', 'консультация', 'менеджер', 'техподдержка', 'оферта', 'договор'
    ]
    
    # Информационные маркеры
    info_markers = [
        'что такое', 'как', 'почему', 'зачем', 'когда', 'где', 'кто', 'какой',
        'это', 'значит', 'определение', 'понятие', 'термин', 'смысл',
        'пример', 'примеры', 'виды', 'типы', 'классификация',
        'инструкция', 'руководство', 'гайд', 'урок', 'туториал',
        'совет', 'рекомендация', 'лучший', 'топ', 'рейтинг', 'обзор',
        'отзыв', 'отзывы', 'мнение', 'сравнение', 'отличие', 'разница',
        'история', 'происхождение', 'статистика', 'факт', 'новость',
        'бесплатно', 'скачать', 'реферат', 'курсовая', 'доклад', 'презентация',
        'википедия', 'синопсис', 'это простыми словами', 'простыми словами'
    ]
    
    commercial_score = sum(1 for marker in commercial_markers if marker in keyword_lower)
    info_score = sum(1 for marker in info_markers if marker in keyword_lower)
    
    if commercial_score > info_score and commercial_score > 0:
        return 'commercial'
    elif info_score > commercial_score and info_score > 0:
        return 'informational'
    elif commercial_score > 0:
        return 'commercial'
    elif info_score > 0:
        return 'informational'
    else:
        return 'other'

# Классификация запросов
print("\nКлассификация запросов...")
df['query_type'] = df['Ключевое слово'].apply(classify_query)

# Статистика по типам запросов
type_counts = df['query_type'].value_counts()
print(f"\nРаспределение типов запросов:")
print(type_counts)

# Подготовка данных для кластеризации
print("\nПодготовка данных для кластеризации...")

# Фильтрация только русских/английских ключевых слов для векторизации
keywords = df['Ключевое слово'].tolist()

# TF-IDF векторизация
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.95
)

tfidf_matrix = vectorizer.fit_transform(keywords)
print(f"Размерность TF-IDF матрицы: {tfidf_matrix.shape}")

# Определение оптимального количества кластеров (метод локтя)
from sklearn.metrics import silhouette_score

print("\nПоиск оптимального количества кластеров...")
inertias = []
silhouette_scores = []
K_range = range(5, 21, 5)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10, max_iter=300)
    labels = kmeans.fit_predict(tfidf_matrix)
    inertias.append(kmeans.inertia_)
    if len(set(labels)) > 1:
        sil_score = silhouette_score(tfidf_matrix, labels, sample_size=min(5000, tfidf_matrix.shape[0]))
        silhouette_scores.append(sil_score)
    else:
        silhouette_scores.append(0)
    print(f"K={k}: Inertia={kmeans.inertia_:.2f}, Silhouette={silhouette_scores[-1]:.4f}")

# Выбор количества кластеров на основе силуэта
optimal_k = K_range[np.argmax(silhouette_scores)]
print(f"\nОптимальное количество кластеров: {optimal_k}")

# Финальная кластеризация
print(f"\nВыполнение кластеризации с K={optimal_k}...")
kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10, max_iter=300)
df['cluster'] = kmeans.fit_predict(tfidf_matrix)

# Анализ кластеров
print("\n=== Анализ кластеров ===")
cluster_stats = df.groupby('cluster').agg({
    'Ключевое слово': 'count',
    'Частотность Весь мир': 'mean',
    'query_type': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 'other'
}).rename(columns={
    'Ключевое слово': 'size',
    'Частотность Весь мир': 'avg_frequency',
    'query_type': 'dominant_type'
})

print(cluster_stats.sort_values('size', ascending=False))

# Примеры ключевых слов из каждого кластера
print("\n=== Примеры ключевых слов по кластерам ===")
for cluster_id in sorted(df['cluster'].unique()):
    cluster_keywords = df[df['cluster'] == cluster_id]['Ключевое слово'].head(10).tolist()
    cluster_types = df[df['cluster'] == cluster_id]['query_type'].value_counts().to_dict()
    print(f"\nКластер {cluster_id} ({len(df[df['cluster'] == cluster_id])} ключей):")
    print(f"  Типы: {cluster_types}")
    print(f"  Примеры: {cluster_keywords[:5]}")

# Сохранение результатов
print("\nСохранение результатов...")

# Основной файл с кластеризацией
output_file = '/workspace/msk_unisender_cleaned_clustered.csv'
df.to_csv(output_file, index=False, sep=';', encoding='utf-8')
print(f"Основной файл сохранен: {output_file}")

# Отдельно коммерческие страницы
commercial_df = df[df['query_type'] == 'commercial'].copy()
commercial_file = '/workspace/msk_unisender_commercial.csv'
commercial_df.to_csv(commercial_file, index=False, sep=';', encoding='utf-8')
print(f"Коммерческие запросы ({len(commercial_df)}): {commercial_file}")

# Отдельно информационные страницы
info_df = df[df['query_type'] == 'informational'].copy()
info_file = '/workspace/msk_unisender_informational.csv'
info_df.to_csv(info_file, index=False, sep=';', encoding='utf-8')
print(f"Информационные запросы ({len(info_df)}): {info_file}")

# Сводная статистика
summary = {
    'total_keywords': len(df),
    'commercial_count': len(commercial_df),
    'informational_count': len(info_df),
    'other_count': len(df[df['query_type'] == 'other']),
    'num_clusters': optimal_k,
    'clusters_info': cluster_stats.to_dict()
}

import json
with open('/workspace/clustering_summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=2, default=str)
print(f"\nСводка сохранена: /workspace/clustering_summary.json")

print("\n=== Готово! ===")
print(f"Всего ключевых слов: {len(df)}")
print(f"Коммерческих: {len(commercial_df)} ({len(commercial_df)/len(df)*100:.1f}%)")
print(f"Информационных: {len(info_df)} ({len(info_df)/len(df)*100:.1f}%)")
print(f"Других: {len(df[df['query_type'] == 'other'])} ({len(df[df['query_type'] == 'other'])/len(df)*100:.1f}%)")
print(f"Количество кластеров: {optimal_k}")
