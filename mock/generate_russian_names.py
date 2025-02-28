import random
import json
import argparse

# Russian first names (male)
male_first_names = [
    "Александр", "Алексей", "Андрей", "Артем", "Борис", "Вадим", "Василий", "Виктор",
    "Владимир", "Георгий", "Даниил", "Денис", "Дмитрий", "Евгений", "Егор", "Иван",
    "Игорь", "Илья", "Кирилл", "Константин", "Лев", "Максим", "Михаил", "Никита",
    "Николай", "Олег", "Павел", "Петр", "Роман", "Сергей", "Станислав", "Степан",
    "Тимофей", "Федор", "Юрий", "Ярослав"
]

# Russian first names (female)
female_first_names = [
    "Алена", "Александра", "Алиса", "Алла", "Анастасия", "Анна", "Валентина", "Валерия",
    "Вера", "Виктория", "Галина", "Дарья", "Евгения", "Екатерина", "Елена", "Елизавета",
    "Ирина", "Карина", "Кристина", "Ксения", "Любовь", "Людмила", "Маргарита", "Марина",
    "Мария", "Надежда", "Наталья", "Нина", "Оксана", "Ольга", "Полина", "Светлана",
    "София", "Татьяна", "Юлия", "Яна"
]

# Russian last names (male endings)
male_last_names = [
    "Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", 
    "Михайлов", "Новиков", "Федоров", "Морозов", "Волков", "Алексеев", "Лебедев",
    "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов",
    "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов",
    "Яковлев", "Григорьев", "Романов", "Воробьев", "Сергеев", "Кузьмин", "Фролов",
    "Александров", "Дмитриев", "Королев", "Гусев", "Киселев", "Ильин", "Максимов",
    "Поляков", "Сорокин", "Виноградов", "Ковалев", "Белов", "Медведев", "Антонов",
    "Тарасов", "Жуков", "Баранов", "Филиппов", "Комаров", "Давыдов", "Беляев",
    "Герасимов", "Богданов", "Осипов", "Сидоров", "Матвеев", "Титов", "Марков",
    "Миронов", "Крылов", "Куликов", "Карпов", "Власов", "Мельников", "Денисов",
    "Гаврилов", "Тихонов", "Казаков", "Афанасьев", "Данилов", "Савельев", "Тимофеев"
]

# Russian last names (female endings)
def get_female_last_name(male_last_name):
    """Convert male last name to female form"""
    if male_last_name.endswith("ий"):
        return male_last_name[:-2] + "ая"
    elif male_last_name.endswith("ый"):
        return male_last_name[:-2] + "ая"  
    elif male_last_name.endswith("ой"):
        return male_last_name[:-2] + "ая"
    else:
        return male_last_name + "а"

# Generate patronymics
male_patronymic_names = [
    "Александрович", "Алексеевич", "Андреевич", "Антонович", "Аркадьевич", "Артемович",
    "Борисович", "Вадимович", "Валентинович", "Валерьевич", "Васильевич", "Викторович",
    "Витальевич", "Владимирович", "Вячеславович", "Геннадьевич", "Георгиевич", "Глебович",
    "Григорьевич", "Данилович", "Денисович", "Дмитриевич", "Евгеньевич", "Егорович", 
    "Иванович", "Игоревич", "Ильич", "Константинович", "Леонидович", "Львович", 
    "Максимович", "Михайлович", "Николаевич", "Олегович", "Павлович", "Петрович", 
    "Романович", "Семенович", "Сергеевич", "Станиславович", "Степанович", "Федорович",
    "Юрьевич", "Яковлевич", "Ярославович"
]

female_patronymic_names = [
    "Александровна", "Алексеевна", "Андреевна", "Антоновна", "Аркадьевна", "Артемовна",
    "Борисовна", "Вадимовна", "Валентиновна", "Валерьевна", "Васильевна", "Викторовна",
    "Витальевна", "Владимировна", "Вячеславовна", "Геннадьевна", "Георгиевна", "Глебовна",
    "Григорьевна", "Даниловна", "Денисовна", "Дмитриевна", "Евгеньевна", "Егоровна", 
    "Ивановна", "Игоревна", "Ильинична", "Константиновна", "Леонидовна", "Львовна", 
    "Максимовна", "Михайловна", "Николаевна", "Олеговна", "Павловна", "Петровна", 
    "Романовна", "Семеновна", "Сергеевна", "Станиславовна", "Степановна", "Федоровна",
    "Юрьевна", "Яковлевна", "Ярославовна"
]

# Generate email domains
email_domains = ["mail.ru", "yandex.ru", "gmail.com", "rambler.ru", "list.ru", "bk.ru", "inbox.ru", "ya.ru"]

def generate_email(first_name, last_name):
    """Generate a realistic email based on the person's name"""
    domain = random.choice(email_domains)
    
    # Transliterate Russian names to Latin for email
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }
    
    def transliterate(text):
        return ''.join(translit_map.get(char.lower(), char) for char in text)
    
    first_translit = transliterate(first_name)
    last_translit = transliterate(last_name)
    
    # Choose email format
    email_format = random.choice([
        f"{first_translit.lower()}_{last_translit.lower()}@{domain}",
        f"{first_translit.lower()[0]}.{last_translit.lower()}@{domain}",
        f"{first_translit.lower()}.{last_translit.lower()}@{domain}",
        f"{last_translit.lower()}.{first_translit.lower()}@{domain}",
        f"{first_translit.lower()}{random.randint(1, 999)}@{domain}",
        f"{last_translit.lower()}{random.randint(1, 999)}@{domain}"
    ])
    
    return email_format

def generate_person(include_patronymic=True):
    """Generate a random Russian person"""
    gender = random.choice(["male", "female"])
    
    if gender == "male":
        first_name = random.choice(male_first_names)
        patronymic = random.choice(male_patronymic_names) if include_patronymic else None
        last_name = random.choice(male_last_names)
    else:
        first_name = random.choice(female_first_names)
        patronymic = random.choice(female_patronymic_names) if include_patronymic else None
        male_last = random.choice(male_last_names)
        last_name = get_female_last_name(male_last)
    
    email = generate_email(first_name, last_name)
    
    person = {
        "firstName": first_name,
        "lastName": last_name,
        "gender": gender,
        "email": email,
    }
    
    if include_patronymic:
        person["patronymic"] = patronymic
        person["fullName"] = f"{last_name} {first_name} {patronymic}"
    else:
        person["fullName"] = f"{last_name} {first_name}"
        
    return person

def generate_users(count, include_patronymic=True):
    """Generate multiple random users"""
    users = []
    for _ in range(count):
        person = generate_person(include_patronymic)
        password = "Password123!" # Default password for testing
        role = random.choice(["citizen", "citizen", "citizen", "citizen"]) # 80% citizens, 20% moderators
        
        users.append({
            "name": person["fullName"],
            "email": person["email"],
            "password": password,
            "role": role,
            "firstName": person["firstName"],
            "lastName": person["lastName"],
            "gender": person["gender"],
        })
    
    return users

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate random Russian names for mock users")
    parser.add_argument("-n", "--number", type=int, default=10, help="Number of users to generate")
    parser.add_argument("-o", "--output", type=str, default="mock_users.json", help="Output file name")
    parser.add_argument("-p", "--no-patronymic", action="store_true", help="Don't include patronymics")
    parser.add_argument("-s", "--sql", action="store_true", help="Generate SQL INSERT statements")
    
    args = parser.parse_args()
    
    users = generate_users(args.number, not args.no_patronymic)
    
    # Save as JSON
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    
    print(f"Generated {args.number} Russian users in {args.output}")
    
    # Generate SQL if requested
    if args.sql:
        sql_file = args.output.replace(".json", ".sql")
        with open(sql_file, "w", encoding="utf-8") as f:
            f.write("-- SQL INSERT statements for mock Russian users\n\n")
            
            for user in users:
                f.write(f"INSERT INTO users (name, email, password, role) VALUES ('{user['name']}', '{user['email']}', '{"$2b$10$GK5HXjPMjB6xjUWuOUJuRe6fKdwPWR/jCx69pd4iyJ937vwyfRyNu"}', '{user['role']}');\n")
                
        print(f"Generated SQL statements in {sql_file}")