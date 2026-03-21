export function getDisplayName(account) {
    if (!account)
        return 'Unknown';
    if (account.display_name && account.display_name.trim().length > 0)
        return account.display_name;
    if (account.name && account.name.trim().length > 0)
        return account.name;
    if (account.username)
        return account.username;
    if (account.acct)
        return account.acct;
    return 'Unknown';
}
