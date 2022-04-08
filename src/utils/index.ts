import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID
} from 'crypto'

import jsonwebtoken from 'jsonwebtoken'
import { Knex } from 'knex'
import config from '../../config.json'

import { IEncryptedToken, INewOauthAccountResponse, IOauthAccountEntry } from '../Types'

class Utils {
  public static async generate32ByteId(): Promise<string> {
    return new Promise(
      (resolve) => {
        const bytes = randomBytes(32)
        resolve(
          bytes.toString('hex')
        )
      }
    )
  }

  public static async generateUUID(): Promise<string> {
    return new Promise(
      (resolve) => {
        return resolve(
          randomUUID()
        )
      }
    )
  }

  public static async encryptJWT(data: any, expiresIn: number | string): Promise<string> {
    return new Promise(
      (resolve) => {
        const iv = randomBytes(16),
          token  = jsonwebtoken.sign(
            data,
            config.jwt_secret,
            {
              expiresIn
            }
          )

        const cipher  = createCipheriv('aes-256-ctr', config.cypher_iv_key, iv),
            encrypted = Buffer.concat(
              [
                cipher.update(token),
                cipher.final()
              ]
            )
          
        // create one more jwt token, this time containing the encrypted version and iv
        return resolve(
          jsonwebtoken.sign(
            {
              iv: iv.toString('hex'),
              token: encrypted.toString('hex')
            },
            config.jwt_secret
          )
        )
      }
    )
  }

  public static async decryptJWT<T>(token: string): Promise<T | null> {
    return new Promise(
      (resolve) => {
        try {
          jsonwebtoken.verify(token, config.jwt_secret)
        } catch { return resolve(null) }

        const data: IEncryptedToken = jsonwebtoken.decode(token),
          decipher = createDecipheriv(
            'aes-256-ctr',
            config.cypher_iv_key,
            Buffer.from(data.iv, 'hex')
          ),
          decrypted = Buffer.concat(
            [
              decipher.update(
                Buffer.from(data.token, 'hex')
              ),
              decipher.final()
            ]
          )

        const jwt = decrypted.toString()
        try {
          jsonwebtoken.verify(jwt, config.jwt_secret)
        } catch { return resolve(null) }

        const jsonData = jsonwebtoken.decode(jwt) as T
        return resolve(jsonData)
      }
    )
  }

  // insert new oauth created account or via login
  public static async oAuthNewAccountEntry(
    db: Knex,
    oauth: IOauthAccountEntry
  ): Promise<INewOauthAccountResponse> {
    // create new entry in database
    const user = await db.select(
        [
          oauth.idColumn,
          'AccountId',
          'Username'
        ]
      )
      .from('web')
      .where(
        oauth.idColumn,
        oauth.userId
      )
      .first()

    let accountId: string,
      isNew: boolean = false

    if (!user) {
      await db('web')
        .insert(
          {
            AccountId: accountId = await Utils.generateUUID(),
            [oauth.idColumn]: oauth.userId
          }
        )

      isNew = true
    } else {
      accountId = user.AccountId

      if (!user.Username)
        isNew = true
    }

    return {
      accountId,
      isNew
    }
  }
}

export default Utils