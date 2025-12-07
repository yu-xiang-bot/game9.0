import { PiniaCustomStateProperties, PiniaCustomProperties } from 'pinia'
import { useUserInfoStore } from '@/stores/userInfo'

declare module 'pinia' {
  export interface PiniaCustomStateProperties {
    userInfo: ReturnType<typeof useUserInfoStore>['$state']
  }
  
  export interface PiniaCustomProperties {
    userInfoStore: ReturnType<typeof useUserInfoStore>
  }
}
