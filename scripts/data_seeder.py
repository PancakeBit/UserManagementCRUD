import json
import random
import sys

# This script generates sample users for testing and development.
# !!! This script OVERWRITES the existing JSON file with new data. !!!


seed_data = {
    "first_names": [
        "Juan",
        "Maria",
        "Carlos",
        "Ana",
        "Miguel",
        "Sofia",
        "Daniel",
        "Patricia",
        "Gabriel",
        "Elena",
        "James",
        "Emily",
        "Michael",
        "Sarah",
        "David",
        "Jessica",
        "Robert",
        "Ashley",
        "William",
        "Olivia",
    ],
    "last_names": [
        "Dela Cruz",
        "Santos",
        "Reyes",
        "Garcia",
        "Torres",
        "Mendoza",
        "Flores",
        "Navarro",
        "Ramos",
        "Castillo",
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Miller",
        "Davis",
        "Wilson",
        "Moore",
        "Taylor",
    ],
    "email_domains": ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
}


def generate_username_patterns(first_name, last_name):
    first = first_name.lower()
    last = last_name.lower().replace(" ", "_")

    return [
        f"{first}.{last}",
        f"{first[0]}{last}",
        f"{first}{last[0]}",
        f"{first}{last}",
        f"{last}.{first}",
        f"{last[0]}{first}",
        f"{last}{first[0]}",
        f"{first}_{last}",
        f"{first}-{last.replace('_', '-')}",
        f"{first}.{last[0]}",
        f"{first[0]}.{last}",
        f"{first}_{last[0]}",
        f"{last}_{first}",
    ]


def generate_unique_username(first_name, last_name, used_usernames):
    patterns = generate_username_patterns(first_name, last_name)

    available = [
        username
        for username in patterns
        if username not in used_usernames
    ]

    if not available:
        raise ValueError(
            f"Failed to generate a unique username for "
            f"{first_name} {last_name}"
        )

    return random.choice(available)


def generate_email_patterns(first_name, last_name, username=None):
    first = first_name.lower()
    last = last_name.lower().replace(" ", "")

    patterns = [
        f"{first}.{last}",
        f"{first}{last}",
        f"{first[0]}{last}",
        f"{first}.{last[0]}",
        f"{first}_{last}",
        f"{last}.{first}",
        f"{last}{first[0]}",
        f"{first}{last[0]}",
    ]

    if username:
        patterns.extend([
            username,
            username.replace("_", ""),
            username.replace(".", ""),
        ])

    return patterns


def generate_unique_email(first_name, last_name, used_emails, username=None):
    local_parts = generate_email_patterns(
        first_name,
        last_name,
        username
    )

    candidates = [
        f"{local_part}@{domain}"
        for local_part in local_parts
        for domain in seed_data["email_domains"]
    ]

    available = [
        email
        for email in candidates
        if email not in used_emails
    ]

    if not available:
        raise ValueError(
            f"Failed to generate a unique email for "
            f"{first_name} {last_name}"
        )

    return random.choice(available)


def generate_unique_user(used_usernames, used_emails):
    first_name = random.choice(seed_data["first_names"])
    last_name = random.choice(seed_data["last_names"])

    username = generate_unique_username(
        first_name,
        last_name,
        used_usernames
    )

    email = generate_unique_email(
        first_name,
        last_name,
        used_emails,
        username
    )

    return {
        "name": f"{first_name} {last_name}",
        "username": username,
        "email": email
    }


def generate_users(num_users):
    users = []
    used_usernames = set()
    used_emails = set()

    for i in range(num_users):
        user = generate_unique_user(
            used_usernames,
            used_emails
        )

        user["id"] = i + 1

        users.append(user)
        used_usernames.add(user["username"])
        used_emails.add(user["email"])

    return users


def write_users_to_json(users, file_output_path="user.json"):
    with open(file_output_path, "w") as file:
        json.dump(users, file, indent=4)


def main():
    try:
        num_users = int(sys.argv[1])
    except (ValueError, IndexError):
        print("Usage: python generate-users.py <number_of_users>")
        sys.exit(1)

    try:
        file_output_path = sys.argv[2]
    except IndexError:
        file_output_path = "user.json"

    if not 1 <= num_users <= 200:
        print("Number of users must be between 1 and 200.")
        sys.exit(1)

    try:
        users = generate_users(num_users)
        write_users_to_json(users, file_output_path)

        print(
            f"Successfully generated {num_users} users "
            f"to {file_output_path}"
        )

    except ValueError as error:
        print(f"Error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    main()
