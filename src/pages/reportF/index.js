import React, { useState } from 'react'
import { compose, graphql } from 'react-apollo'
import { withTranslation } from 'react-i18next'
import { Button, Card, Typography, Row, List } from 'antd'
import XLSX from 'xlsx'
import openNotificationWithIcon from '../../components/shared/openNotificationWithIcon'

import {
	MENU_PUBLISH_BY_SITE,
	LOCK_UNLOCK_MENU,
	COUNT_BY_MENU,
	ORDER_DISH,
	UPDATE_ORDERJ,
	CLOSE_MENU
} from './reportQuery/reportQuery'
import ReportItemDish from './reportItemDish'
import './index.css'

const { Title } = Typography

function ReportF(props) {
	const { menuPublish, countOrderByMenu, me } = props
	const { menuPublishBySite } = menuPublish
	const [loading, setLoading] = useState(false)
	const [loadingLock, setLoadingLock] = useState(false)
	const [loadingButton, setLoadingButton] = useState(false)

	function exportFile(menu, e) {
		e.stopPropagation()
		const dishes = []
		const counts = {}
		const orders = countOrderByMenu.countByMenuJ
		orders.map(order => {
			if (Object.prototype.hasOwnProperty.call(counts, order.dishId)) {
				counts[order.dishId] += order.count
			} else {
				counts[order.dishId] = order.count
			}
			return counts[order.dishId]
		})
		menu.dishes.forEach(item =>
			dishes.push([item.name, '', '', counts[item._id] || 0])
		)
		console.log(dishes)
		dishes.unshift(['Tên món ăn', '', '', 'Số lượng'])
		dishes.unshift([menu.name])
		dishes.push(['Tổng'])
		dishes.push([new Date()])
		dishes.push(['', '', `Người gửi : ${me.fullName}`])
		const wb = XLSX.utils.book_new()
		const ws = XLSX.utils.aoa_to_sheet(dishes, {
			dateNF: 'HH:mm:ss DD-MM-YYYY'
		})

		if (!ws['!cols']) ws['!cols'] = []
		ws['!cols'][5] = { wch: 17 }

		const merge = [
			{
				s: { r: 0, c: 0 },
				e: { r: 0, c: 3 }
			},
			{
				s: {
					r: dishes.length - 1,
					c: 2
				},
				e: {
					r: dishes.length - 1,
					c: 3
				}
			},
			{
				s: {
					r: dishes.length - 2,
					c: 0
				},
				e: {
					r: dishes.length - 2,
					c: 3
				}
			},
			{
				s: {
					r: dishes.length - 3,
					c: 0
				},
				e: {
					r: dishes.length - 3,
					c: 2
				}
			}
		]
		ws['!merges'] = merge
		ws['!formatRows'] = true
		ws[`D${dishes.length - 2}`] = {
			t: 'n',
			f: `SUM(D3:D${dishes.length - 3})` || 0
		}

		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
		XLSX.writeFile(wb, `${menu.name}.xlsx`, {
			bookType: 'xlsx',
			cellStyles: true
		})
	}

	function onLock(e) {
		e.stopPropagation()
		setLoadingLock(true)
		props
			.lockAndUnlock({
				variables: {
					id: menuPublishBySite._id
				}
			})
			.then(res => {
				props.menuPublish.refetch({
					variables: {
						siteId: props.currentsite
					}
				})
				if (res.data.lockAndUnlockMenu) {
					openNotificationWithIcon('success', 'success', 'Success')
				}
				setLoadingLock(false)
			})
	}

	function onPlus(e, dishId, currentCount) {
		setLoadingButton(true)
		e.stopPropagation()
		props
			.orderDish({
				variables: {
					input: {
						menuId: menuPublishBySite._id,
						dishId,
						count: currentCount + 1
					}
				}
			})
			.then(() => {
				props.countOrderByMenu.refetch({
					variables: {
						menuId: menuPublishBySite._id
					}
				})
				setLoadingButton(false)
			})
	}

	function onMinus(userId, dishId, count) {
		setLoadingButton(true)
		props
			.updateOrder({
				variables: {
					input: {
						menuId: menuPublishBySite._id,
						dishId,
						count: count - 1
					},
					userId
				}
			})
			.then(() => {
				props.countOrderByMenu.refetch({
					variables: {
						menuId: menuPublishBySite._id
					}
				})
				setLoadingButton(false)
			})
	}

	function onCloseMenu(e) {
		setLoading(true)
		e.stopPropagation()
		props
			.closeMenuToExport({
				variables: {
					id: menuPublishBySite._id
				}
			})
			.then(res => {
				props.menuPublish.refetch({
					variables: {
						siteId: props.currentsite
					}
				})
				if (res.data.closeMenu) {
					openNotificationWithIcon('success', 'success', 'Success')
				}
				setLoading(false)
			})
	}

	return (
		<React.Fragment>
			<Row>
				{' '}
				{menuPublish.menuPublishBySite && (
					<Card
						title={
							<div>
								<Title style={{ color: '#ffffff' }} level={3}>
									{menuPublishBySite.name}
								</Title>
							</div>
						}
						bordered={false}
						extra={
							<div style={{ display: 'flex' }}>
								<Button
									type="primary"
									block
									onClick={e => onLock(e)}
									loading={loadingLock}
									disabled={countOrderByMenu.countByMenuJ ? loading : true}
								>
									{menuPublishBySite.isLocked ? 'Lock' : 'Unlock'}
								</Button>
								<Button
									style={{ marginLeft: '5px' }}
									disabled={!menuPublishBySite.isLocked || loadingLock}
									type="primary"
									block
									loading={loading}
									onClick={e => onCloseMenu(e)}
								>
									Complete
								</Button>
								<Button
									style={{ marginLeft: '5px' }}
									disabled={
										!menuPublishBySite.isLocked || loadingLock || loading
									}
									type="primary"
									block
									onClick={e => exportFile(menuPublish.menuPublishBySite, e)}
								>
									Export
								</Button>
							</div>
						}
						headStyle={{
							border: 0
						}}
						bodyStyle={{
							padding: 0
						}}
						style={{ backgroundColor: 'transparent' }}
					>
						<List
							style={{
								margin: '1em',
								padding: '1em',
								backgroundColor: '#fff',
								borderRadius: '.5em'
							}}
							loading={loadingButton}
							dataSource={
								countOrderByMenu.countByMenuJ && menuPublishBySite.dishes
							}
							renderItem={dish => (
								<List.Item style={{ display: 'block' }}>
									<ReportItemDish
										key={dish._id}
										{...dish}
										loadingButton={loadingButton}
										onPlus={onPlus}
										onMinus={onMinus}
										me={me}
										menu={countOrderByMenu.countByMenuJ}
									/>
								</List.Item>
							)}
						/>
					</Card>
				)}
			</Row>
		</React.Fragment>
	)
}

export default compose(
	graphql(MENU_PUBLISH_BY_SITE, {
		name: 'menuPublish',
		skip: props => !props.currentsite,
		options: props => ({
			fetchPolicy: 'no-cache',
			variables: {
				siteId: props.currentsite
			}
		})
	}),
	graphql(LOCK_UNLOCK_MENU, {
		name: 'lockAndUnlock'
	}),
	graphql(COUNT_BY_MENU, {
		name: 'countOrderByMenu',
		skip: props => !props.menuPublish.menuPublishBySite,
		options: props => ({
			fetchPolicy: 'no-cache',
			variables: {
				menuId:
					(props.menuPublish.menuPublishBySite &&
						props.menuPublish.menuPublishBySite._id) ||
					''
			}
		})
	}),
	graphql(ORDER_DISH, {
		name: 'orderDish'
	}),
	graphql(UPDATE_ORDERJ, {
		name: 'updateOrder'
	}),
	graphql(CLOSE_MENU, {
		name: 'closeMenuToExport'
	})
)(withTranslation('translations')(ReportF))
