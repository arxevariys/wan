import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np

# --- КОНФИГУРАЦИЯ ---
INPUT_FILE = 'keywords.csv'  # Имя входного файла (csv или txt)
OUTPUT_FILE = 'clusters_result.csv'
CITY_NAME = 'калуга'
MIN_FREQUENCY = 10  # Минимальная частотность для оставления запроса (поставьте 0, если нет столбца частот)
FREQUENCY_COLUMN = 'freq'  # Название столбца с частотностью (если есть)
KEYWORD_COLUMN = 'keyword' # Название столбца с ключевыми словами

# Стоп-слова и мусор (можно дополнять)
STOP_WORDS = [
    'скачать', 'бесплатно', 'реферат', 'курсовая', 'фото', 'видео', 'смотреть', 
    'онлайн', 'форум', 'отзывы', 'википедия', 'что такое', 'кто такой'
]

def load_data(filepath):
    """Загрузка данных из CSV или TXT"""
    try:
        if filepath.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_csv(filepath, sep='\t', header=None, names=[KEYWORD_COLUMN])
        
        # Приводим к строке и нижнему регистру
        df[KEYWORD_COLUMN] = df[KEYWORD_COLUMN].astype(str).str.lower().str.strip()
        return df
    except Exception as e:
        print(f"Ошибка загрузки файла: {e}")
        return None

def clean_keywords(df):
    """Очистка ключевых слов по правилам"""
    initial_count = len(df)
    print(f"Загружено строк: {initial_count}")

    # 1. Фильтр по частотности (если есть столбец)
    if FREQUENCY_COLUMN in df.columns:
        df[FREQUENCY_COLUMN] = pd.to_numeric(df[FREQUENCY_COLUMN], errors='coerce').fillna(0)
        df = df[df[FREQUENCY_COLUMN] >= MIN_FREQUENCY]
        print(f"После фильтра по частоте (>={MIN_FREQUENCY}): {len(df)}")

    # 2. Гео-фильтр (Оставляем только 'калуга' или без гео)
    def check_geo(text):
        text_lower = str(text).lower()
        # Список городов-исключений (кроме Калуги), можно расширить
        other_cities = ['москва', 'спб', 'санкт-петербург', 'казань', 'екатеринбург', 'новосибирск']
        
        # Если есть другой город -> удаляем
        for city in other_cities:
            if city in text_lower:
                return False
        
        # Если есть 'калуга' -> оставляем
        if CITY_NAME in text_lower:
            return True
            
        # Если нет никакого города (простая эвристика: проверяем наличие других крупных городов)
        # Для точности лучше использовать список всех городов РФ, здесь упрощенно:
        # Оставляем, если нет явного указания на ДРУГОЙ город
        return True

    df = df[df[KEYWORD_COLUMN].apply(check_geo)]
    print(f"После гео-фильтра (Калуга + без гео): {len(df)}")

    # 3. Удаление мусорных фраз
    def is_mush(text):
        for stop in STOP_WORDS:
            if stop in text:
                return True
        return False
    
    df = df[~df[KEYWORD_COLUMN].apply(is_mush)]
    print(f"После удаления мусора: {len(df)}")
    
    # Удаление дублей
    df = df.drop_duplicates(subset=[KEYWORD_COLUMN])
    print(f"После удаления дублей: {len(df)}")

    return df

def clusterize(df, n_clusters=10):
    """Кластеризация запросов"""
    if len(df) == 0:
        return df

    # Векторизация текста
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    try:
        X = vectorizer.fit_transform(df[KEYWORD_COLUMN])
    except ValueError:
        print("Недостаточно данных для векторизации.")
        return df

    # Определение оптимального числа кластеров (если мало данных)
    real_clusters = min(n_clusters, len(df))
    if real_clusters < 2:
        df['cluster_id'] = 0
        df['cluster_name'] = df[KEYWORD_COLUMN]
        return df

    kmeans = KMeans(n_clusters=real_clusters, random_state=42, n_init=10)
    df['cluster_id'] = kmeans.fit_predict(X)

    # Генерация имени кластера (берем самое частотное слово или первое в кластере)
    def get_cluster_name(group):
        # Простая эвристика: объединяем первые 3 слова
        return " | ".join(group[KEYWORD_COLUMN].head(3).tolist())

    cluster_names = df.groupby('cluster_id').apply(get_cluster_name)
    df['cluster_name'] = df['cluster_id'].map(cluster_names)

    return df

def main():
    print("--- Запуск SEO Кластеризатора (Калуга) ---")
    
    # Проверка наличия файла
    import os
    if not os.path.exists(INPUT_FILE):
        print(f"Файл {INPUT_FILE} не найден. Создайте файл со списком ключевых слов.")
        # Создадим демо-файл для теста
        demo_data = {
            KEYWORD_COLUMN: [
                "купить окна калуга", "пластиковые окна москва", "ремонт окон калуга", 
                "окна цена", "скачать окна бесплатно", "калуга окна профиль", 
                "деревянные окна спб", "замер окон калуга", "окна vikna", "частотность"
            ],
            FREQUENCY_COLUMN: [50, 100, 20, 5, 0, 30, 40, 15, 10, 2]
        }
        pd.DataFrame(demo_data).to_csv(INPUT_FILE, index=False)
        print(f"Создан демо-файл {INPUT_FILE} для примера.")

    df = load_data(INPUT_FILE)
    if df is None:
        return

    df_clean = clean_keywords(df)
    
    if len(df_clean) > 0:
        df_result = clusterize(df_clean, n_clusters=5) # Можно менять число кластеров
        
        # Сортировка
        df_result = df_result.sort_values(by=['cluster_id', FREQUENCY_COLUMN if FREQUENCY_COLUMN in df_result.columns else KEYWORD_COLUMN], ascending=[True, False])
        
        df_result.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        print(f"\nГотово! Результат сохранен в {OUTPUT_FILE}")
        print(f"Всего кластеров: {df_result['cluster_id'].nunique()}")
    else:
        print("После очистки не осталось данных.")

if __name__ == "__main__":
    main()
