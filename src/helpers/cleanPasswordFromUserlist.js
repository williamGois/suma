/**
 * Essa helper remove o password da lista de usuários
 * @param {Object[]} userList Uma lista de usuários que tenham password para serem removidos
 */
export default function(userList) {
  return userList.map(user => {
    delete user.password;
    return user;
  });
}
