document.addEventListener('DOMContentLoaded', function() {
    var chartDom = document.getElementById('treeChart');
    var myChart = echarts.init(chartDom);
    var isRadial = false;

    // Function to generate the initial tree data
    function generateInitialTree(startNode) {
        return [{
            name: startNode,
            id: '1',
            children: []
        }];
    }

    // Initial data structure
    var data = [
        {
            name: 'Knowledge',
            id: '1',
            children: [
                {
                    name: 'Science',
                    id: '1-1',
                    children: [
                        { name: 'Physics', id: '1-1-1' },
                        { name: 'Chemistry', id: '1-1-2' },
                        { name: 'Biology', id: '1-1-3' }
                    ]
                },
                {
                    name: 'Arts',
                    id: '1-2',
                    children: [
                        { name: 'Literature', id: '1-2-1' },
                        { name: 'Music', id: '1-2-2' },
                        { name: 'Visual Arts', id: '1-2-3' }
                    ]
                },
                {
                    name: 'Philosophy',
                    id: '1-3',
                    children: [
                        { name: 'Ethics', id: '1-3-1' },
                        { name: 'Logic', id: '1-3-2' },
                        { name: 'Metaphysics', id: '1-3-3' }
                    ]
                }
            ]
        }
    ];

    window.addEventListener('resize', function() {
        myChart.resize();
    });

    // Function to find a node by its id
    function findNodeById(nodes, id) {
        for (let node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                let found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    // Function to get the path to a node
    function getPathToNode(nodes, id) {
        let path = [];
        let current = findNodeById(nodes, id);
        while (current) {
            path.unshift(current.name);
            let idSegments = current.id.split('-');
            if (idSegments.length === 1) break;  // Stop at root
            current = findNodeById(nodes, idSegments.slice(0, -1).join('-'));
        }
        return path;
    }

    function updateTreeDepth(node, depth) {
        if (!node) return;
        node.collapsed = depth > 3;  // Collapse nodes beyond depth 3
        if (node.children) {
            node.children.forEach(child => updateTreeDepth(child, depth + 1));
        }
    }

    async function initializeTreeData(data) {
        for (let node of data) {
            updateTreeDepth(node, 0);
            node.collapsed = false;
            if (node.children) {
                node.children.forEach(child => child.collapsed = false);
            }
            await processRootNode(node);
        }
    }

    // Function to update the chart based on layout
    function updateChart() {
        option = {
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            series: [
                {
                    type: 'tree',
                    data: data,
                    top: isRadial ? '20%' : '5%',
                    bottom: isRadial ? '20%' : '5%',
                    layout: isRadial ? 'radial' : 'orthogonal',
                    symbol: 'emptyCircle',
                    symbolSize: 11,
                    initialTreeDepth: 3,
                    animationDurationUpdate: 750,
                    emphasis: { focus: 'descendant' },
                    label: {
                        position: isRadial ? 'radial' : 'left',
                        rotate: 0,
                        verticalAlign: 'middle',
                        align: isRadial ? 'right' : 'right',
                        fontSize: 12,
                        distance: 5,
                        formatter: function(params) {
                            return params.name.length > 40 ? params.name.slice(0, 40) + '...' : params.name;
                        }
                    },
                    leaves: {
                        label: {
                            position: isRadial ? 'radial' : 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    },
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750,
                    itemStyle: { color: '#66c18c', borderColor: '#66c18c' },
                    lineStyle: { color: '#c0a378', curveness: 0.5 },
                    roam: true,
                    nodePadding: 20,
                    nodeGap: 20
                }
            ]
        };

        myChart.setOption(option);
    }

    async function expandRootNode(rootNode) {
        myChart.showLoading({
            text: 'Expanding...',
            color: '#66c18c',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0)',
            zlevel: 0
        });
        var treeLang = document.getElementById("langInput").value;
        var treeKey = document.getElementById("keyInput").value;

        try {
            const response = await fetch('https://tree-of-knowledge.org/generate-nodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeName: rootNode.name, path: [rootNode.name], treeLang: treeLang, keyInp: treeKey }),
            });
            const newNodes = await response.json();
            rootNode.children = newNodes.map((name, index) => ({
                name: name,
                id: `${rootNode.id}-${index + 1}`
            }));
            rootNode.collapsed = false;
        } catch (error) {
            console.error('Error generating new nodes for root:', error);
        } finally {
            myChart.hideLoading();
        }
        return rootNode;
    }

    updateChart();

    async function processRootNode(rootNode) {
        if (!rootNode.children || rootNode.children.length === 0) {
            await expandRootNode(rootNode);
            updateChart();
        }
        await describeRootNode(rootNode);
    }

    async function describeRootNode(rootNode) {
        const path = getPathToNode(data, rootNode.id);
        const nodeInfoContent = document.getElementById('nodeInfoContent');
        var treeLang = document.getElementById("langInput").value;
        var treeKey = document.getElementById("keyInput").value;

        nodeInfoContent.innerHTML = marked.parse(`# ${rootNode.name}\n\nPath: ${path.join(' > ')}\n\nLoading description...`);

        try {
            const response = await fetch('https://tree-of-knowledge.org/describe-node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeName: rootNode.name, path: path, treeLang: treeLang, keyInp: treeKey }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let markdown = `# ${rootNode.name}\n\nPath: ${path.join(' > ')}\n\n`;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                markdown += chunk;
                nodeInfoContent.innerHTML = marked.parse(markdown);
            }
        } catch (error) {
            console.error('Error fetching root node description:', error);
            nodeInfoContent.innerHTML = marked.parse(`# ${rootNode.name}\n\nPath: ${path.join(' > ')}\n\nError fetching description.`);
        }
    }

    // Listen for startNode element event
    var element = document.getElementById('startNode');
    if (element) {
        element.addEventListener('click', function() {
            var startNode = document.getElementById('startNode').value;
            data = generateInitialTree(startNode);
            updateChart();

            setTimeout(function() {
                if (data && data.length > 0) {
                    processRootNode(data[0]);
                }
            }, 800);
        });
    } else {
        console.error('Element with id "startNode" not found.');
    }

    myChart.on('click', async function(params) {
        if (params.componentType === 'series' && params.seriesType === 'tree') {
            const nodeId = params.data.id;
            const nodeName = params.data.name;

            const rootNode = findNodeById(data, nodeId);
            await processRootNode(rootNode);
        }
    });

    document.getElementById('toggleLayout').addEventListener('click', function() {
        isRadial = !isRadial;
        updateChart();
    });
});
